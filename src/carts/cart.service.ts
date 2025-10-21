import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CreateCartDto } from './dto/create-cart.dto';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';
import { UpdateCustomizationDto } from './dto/update-customization.dto';
import {
  Cart,
  CartItem,
  CartItemRecord,
  NewCartItem,
} from '../database/schemas';
import { CartGateway } from './cart.gateway';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartGateway: CartGateway,
    private readonly productsService: ProductsService,
  ) {}

  async createCart(
    createCartDto: CreateCartDto,
  ): Promise<Cart & { items: CartItemRecord[] }> {
    const { conversationId, items } = createCartDto;

    // Create new cart with conversation_id
    const newCart = await this.cartRepository.create({
      conversationId,
      totalItems: 0,
      totalPrice: '0',
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
          price: product.price.toString(),
          quantity: Math.min(item.quantity, product.stock || item.quantity),
          imageUrl: product.imageUrl || product.images?.[0] || null,
          maxStock: product.stock || 999,
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

    // Add new items
    if (updateCartDto.items && updateCartDto.items.length > 0) {
      for (const item of updateCartDto.items) {
        // Fetch product data from external API

        if (item.operation === 'add') {
          const product = await this.productsService.get(
            `/products/${item.productId}`,
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
            price: product.price.toString(),
            quantity: Math.min(item.quantity, product.stock || item.quantity),
            imageUrl: product.imageUrl || product.images?.[0] || null,
            maxStock: product.stock || 999,
          };
          await this.cartRepository.createCartItem(newCartItem);
        }

        if (item.operation === 'remove') {
          await this.cartRepository.deleteCartItem(item.productId);
        } else {
          await this.cartRepository.updateCartItem(item.productId, {
            quantity: item.quantity,
          });
        }
      }
    }

    // Recalculate totals
    const { totalItems, totalPrice } =
      await this.cartRepository.calculateCartTotals(id);

    // Update cart totals
    const updatedCart = await this.cartRepository.update(id, {
      totalItems,
      totalPrice,
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
}
