import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartChangelogRepository } from './cart-changelog.repository';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCustomizationDto } from './dto/update-customization.dto';
import {
  Cart, CartItemRecord,
  NewCartItem
} from '../database/schemas';
import { CartGateway } from './cart.gateway';
import { ProductsService } from '../products/products.service';
import { UpdateCartSuggestionsDto } from './dto/update-cart-suggestions.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartChangelogRepository: CartChangelogRepository,
    private readonly cartGateway: CartGateway,
    private readonly productsService: ProductsService,
  ) {}

  async createCart(
    createCartDto: CreateCartDto,
  ): Promise<Cart & { items: CartItemRecord[] }> {
    const { conversationId, items, fullName, documentType, documentNumber } = createCartDto;

    // Create new cart with conversation_id and customer info
    const newCart = await this.cartRepository.create({
      conversationId,
      totalItems: 0,
      totalPrice: '0',
      fullName,
      documentType,
      documentNumber,
    });

    // Add items if provided
    const cartItems: CartItemRecord[] = [];
    if (items && items.length > 0) {
      for (const item of items) {
        // Fetch product data from external API
        const product = await this.productsService.get(
          `/products/${item.productId}`,
        );

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        const newCartItem: NewCartItem = {
          cartId: newCart.id,
          productId: item.productId,
          name: product.name,
          sku: product.sku,
          size: product.size || null,
          color: product.color || null,
          price: product.price.amount,
          quantity: Math.min(item.quantity, product.stock || item.quantity),
          imageUrl: product.imageUrl || product.images?.[0] || null,
        };
        const createdItem =
          await this.cartRepository.createCartItem(newCartItem);
        cartItems.push(createdItem);
      }

      // Recalculate totals if items were added
      const { totalItems, totalPrice } =
        await this.cartRepository.calculateCartTotals(newCart.id);
      await this.cartRepository.update(newCart.id, {
        totalItems,
        totalPrice,
      });
    }

    // Return cart with items
    const cartWithItems = await this.cartRepository.findByIdWithItems(
      newCart.id,
    );
    if (!cartWithItems) {
      throw new BadRequestException('Failed to retrieve created cart');
    }

    // Emit real-time event
    this.cartGateway.emitCartUpdated(newCart.id, cartWithItems);

    return cartWithItems;
  }

  async getAllCarts(): Promise<Cart[]> {
    return await this.cartRepository.findAll();
  }

  async getCartById(id: string): Promise<Cart & { items: CartItemRecord[] }> {
    const cart = await this.cartRepository.findByIdWithItems(id);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    return cart;
  }

  async getCartByConversationId(
    conversationId: string,
  ): Promise<Cart & { items: CartItemRecord[] }> {
    const cart =
      await this.cartRepository.findByConversationIdWithItems(conversationId);
    if (!cart) {
      throw new NotFoundException(
        `Cart with conversation ID ${conversationId} not found`,
      );
    }
    return cart;
  }

  async updateCartById(
    id: string,
    updateCartDto: UpdateCartDto,
  ): Promise<Cart & { items: CartItemRecord[] }> {
    const existingCart = await this.cartRepository.findById(id);
    if (!existingCart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }

    // Clear existing items
    // await this.cartRepository.deleteCartItemsByCartId(id)

    if (updateCartDto.suggestions && updateCartDto.suggestions.length > 0) {
      await this.updateCartSuggestions(id, { suggestions: updateCartDto.suggestions });
    }

    // Add new items
    if (updateCartDto.items && updateCartDto.items.length > 0) {
      for (const item of updateCartDto.items) {
        // Fetch product data for changelog
        const product = await this.productsService.getProductById(
          item.productId,
        );

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (item.operation === 'add') {
          await this.cartRepository.addCartItemByProductId({
            cartId: id,
            productId: item.productId,
            quantity: item.quantity,
          });

          // Registrar en changelog
          await this.cartChangelogRepository.create({
            cartId: id,
            productId: item.productId,
            productName: product.name,
            sku: product.sku || null,
            operation: 'add',
            quantity: item.quantity,
            price: product.price?.amount?.toString() || null,
          });
        } else {
          await this.cartRepository.removeCartItemByProductId({
            cartId: id,
            productId: item.productId,
            quantity: item.quantity,
          });

          // Registrar en changelog
          await this.cartChangelogRepository.create({
            cartId: id,
            productId: item.productId,
            productName: product.name,
            sku: product.sku || null,
            operation: 'remove',
            quantity: item.quantity,
            price: product.price?.amount?.toString() || null,
          });
        }
      }
    }

    // Recalculate totals
    const { totalItems, totalPrice } =
      await this.cartRepository.calculateCartTotals(id);

    // Update cart totals and customer info if provided
    const updatedCart = await this.cartRepository.update(id, {
      totalItems,
      totalPrice,
      ...(updateCartDto.fullName !== undefined && { fullName: updateCartDto.fullName }),
      ...(updateCartDto.documentType !== undefined && { documentType: updateCartDto.documentType }),
      ...(updateCartDto.documentNumber !== undefined && { documentNumber: updateCartDto.documentNumber }),
    });

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart');
    }

    // Return cart with items
    const cartWithItems = await this.cartRepository.findByIdWithItems(id);
    if (!cartWithItems) {
      throw new BadRequestException('Failed to retrieve updated cart');
    }

    // Emit real-time event
    this.cartGateway.emitCartUpdated(id, cartWithItems);

    return cartWithItems;
  }

  async updateCartSuggestions(
    id: string,
    updateCartDto: UpdateCartSuggestionsDto,
  ): Promise<any> {
    const existingCart = await this.cartRepository.findById(id);
    if (!existingCart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }

    // Clear existing items
    // await this.cartRepository.deleteCartItemsByCartId(id)

    const suggestions: NewCartItem[] = [];

    // Add new items
    if (updateCartDto.suggestions && updateCartDto.suggestions.length > 0) {
      for (const item of updateCartDto.suggestions) {
        // Fetch product data for changelog
        const product = await this.productsService.getProductById(
          item.productId,
        );

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        const newCartItem: NewCartItem = {
          cartId: id,
          productId: item.productId,
          name: product.name,
          sku: product.sku,
          size: product.size || null,
          color: product.color || null,
          price: product.price.amount,
          quantity: Math.min(item.quantity, product.stock || item.quantity),
          imageUrl: product.imageUrl || product.images?.[0] || null,
        };

        suggestions.push(newCartItem);
      }
    }

    this.cartGateway.emitCartSuggestions(id, suggestions);

    return suggestions;
  }
  async updateCustomization(
    cartId: string,
    updateCustomizationDto: UpdateCustomizationDto,
  ): Promise<Cart & { items: CartItemRecord[] }> {
    const existingCart = await this.cartRepository.findByIdWithItems(cartId);
    if (!existingCart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const { selectedProductIds, customizationValues } = updateCustomizationDto;

    // Update customization values for selected products
    for (const item of existingCart.items) {
      if (selectedProductIds.includes(item.id)) {
        await this.cartRepository.updateCartItem(item.id, {
          customizationValues,
        });
      }
    }

    // Get updated cart
    const updatedCart = await this.cartRepository.findByIdWithItems(cartId);
    if (!updatedCart) {
      throw new BadRequestException('Failed to retrieve updated cart');
    }

    // Emit real-time event
    this.cartGateway.emitCartUpdated(cartId, updatedCart);

    return updatedCart;
  }

  /**
   * Obtiene el historial completo de cambios de un carrito
   */
  async getCartChangelog(cartId: string) {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return await this.cartChangelogRepository.findByCartId(cartId);
  }

  /**
   * Obtiene los últimos N cambios de un carrito
   */
  async getCartChangelogLatest(cartId: string, limit: number = 10) {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return await this.cartChangelogRepository.findLatestByCartId(cartId, limit);
  }

  /**
   * Obtiene el historial de cambios filtrado por operación
   */
  async getCartChangelogByOperation(
    cartId: string,
    operation: 'add' | 'remove'
  ) {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return await this.cartChangelogRepository.findByCartIdAndOperation(
      cartId,
      operation
    );
  }
}
