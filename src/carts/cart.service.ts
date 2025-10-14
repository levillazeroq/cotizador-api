import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { CartRepository } from './cart.repository'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartDto } from './dto/update-cart.dto'
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto'
import { Cart, CartItem, CartItemRecord, NewCartItem } from '../database/schemas'

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(): Promise<Cart & { items: CartItemRecord[] }> {
    let cart = await this.cartRepository.findFirstWithItems()
    
    if (!cart) {
      // Create empty cart if none exists
      const newCart = await this.cartRepository.create({
        totalItems: 0,
        totalPrice: '0',
      })
      cart = { ...newCart, items: [] }
    }

    return cart
  }

  async createCart(): Promise<Cart & { items: CartItemRecord[] }> {
    // Create new empty cart
    const newCart = await this.cartRepository.create({
      totalItems: 0,
      totalPrice: '0',
    })
    
    return { ...newCart, items: [] }
  }

  async getAllCarts(): Promise<Cart[]> {
    return await this.cartRepository.findAll()
  }

  async getCartById(id: string): Promise<Cart & { items: CartItemRecord[] }> {
    const cart = await this.cartRepository.findByIdWithItems(id)
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`)
    }
    return cart
  }

  async addItem(createCartItemDto: CreateCartItemDto): Promise<Cart & { items: CartItemRecord[] }> {
    let cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      // Create cart if none exists
      cart = await this.cartRepository.create({
        totalItems: 0,
        totalPrice: '0',
      })
    }

    // Check if item already exists
    const existingItem = await this.cartRepository.findCartItemByProductId(cart.id, createCartItemDto.productId)

    if (existingItem) {
      // Update quantity if item already exists
      const newQuantity = Math.min(existingItem.quantity + createCartItemDto.quantity, createCartItemDto.maxStock)
      await this.cartRepository.updateCartItem(existingItem.id, { quantity: newQuantity })
    } else {
      // Add new item
      const newCartItem: NewCartItem = {
        cartId: cart.id,
        productId: createCartItemDto.productId,
        name: createCartItemDto.name,
        sku: createCartItemDto.sku,
        size: createCartItemDto.size,
        color: createCartItemDto.color,
        price: createCartItemDto.price.toString(),
        quantity: Math.min(createCartItemDto.quantity, createCartItemDto.maxStock),
        imageUrl: createCartItemDto.imageUrl,
        maxStock: createCartItemDto.maxStock,
      }
      await this.cartRepository.createCartItem(newCartItem)
    }

    // Recalculate totals
    const { totalItems, totalPrice } = await this.cartRepository.calculateCartTotals(cart.id)

    // Update cart totals
    const updatedCart = await this.cartRepository.update(cart.id, {
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    // Return cart with items
    const cartWithItems = await this.cartRepository.findByIdWithItems(cart.id)
    if (!cartWithItems) {
      throw new BadRequestException('Failed to retrieve updated cart')
    }

    return cartWithItems
  }

  async updateItemQuantity(productId: string, updateQuantityDto: UpdateCartItemQuantityDto): Promise<Cart & { items: CartItemRecord[] }> {
    const cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      throw new NotFoundException('Cart not found')
    }

    const existingItem = await this.cartRepository.findCartItemByProductId(cart.id, productId)
    
    if (!existingItem) {
      throw new NotFoundException('Item not found in cart')
    }

    if (updateQuantityDto.quantity === 0) {
      // Remove item if quantity is 0
      await this.cartRepository.deleteCartItem(existingItem.id)
    } else {
      // Update quantity
      const newQuantity = Math.min(updateQuantityDto.quantity, existingItem.maxStock)
      await this.cartRepository.updateCartItem(existingItem.id, { quantity: newQuantity })
    }

    // Recalculate totals
    const { totalItems, totalPrice } = await this.cartRepository.calculateCartTotals(cart.id)

    // Update cart totals
    const updatedCart = await this.cartRepository.update(cart.id, {
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    // Return cart with items
    const cartWithItems = await this.cartRepository.findByIdWithItems(cart.id)
    if (!cartWithItems) {
      throw new BadRequestException('Failed to retrieve updated cart')
    }

    return cartWithItems
  }

  async removeItem(productId: string): Promise<Cart & { items: CartItemRecord[] }> {
    const cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      throw new NotFoundException('Cart not found')
    }

    const existingItem = await this.cartRepository.findCartItemByProductId(cart.id, productId)
    
    if (!existingItem) {
      throw new NotFoundException('Item not found in cart')
    }

    // Remove item
    await this.cartRepository.deleteCartItem(existingItem.id)

    // Recalculate totals
    const { totalItems, totalPrice } = await this.cartRepository.calculateCartTotals(cart.id)

    // Update cart totals
    const updatedCart = await this.cartRepository.update(cart.id, {
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    // Return cart with items
    const cartWithItems = await this.cartRepository.findByIdWithItems(cart.id)
    if (!cartWithItems) {
      throw new BadRequestException('Failed to retrieve updated cart')
    }

    return cartWithItems
  }

  async updateCart(updateCartDto: UpdateCartDto): Promise<Cart & { items: CartItemRecord[] }> {
    let cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      // Create cart if none exists
      cart = await this.cartRepository.create({
        totalItems: 0,
        totalPrice: '0',
      })
    }

    // Clear existing items
    await this.cartRepository.deleteCartItemsByCartId(cart.id)

    // Add new items
    if (updateCartDto.items && updateCartDto.items.length > 0) {
      for (const item of updateCartDto.items) {
        const newCartItem: NewCartItem = {
          cartId: cart.id,
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          size: item.size,
          color: item.color,
          price: item.price.toString(),
          quantity: Math.min(item.quantity, item.maxStock),
          imageUrl: item.imageUrl,
          maxStock: item.maxStock,
        }
        await this.cartRepository.createCartItem(newCartItem)
      }
    }

    // Recalculate totals
    const { totalItems, totalPrice } = await this.cartRepository.calculateCartTotals(cart.id)

    // Update cart totals
    const updatedCart = await this.cartRepository.update(cart.id, {
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    // Return cart with items
    const cartWithItems = await this.cartRepository.findByIdWithItems(cart.id)
    if (!cartWithItems) {
      throw new BadRequestException('Failed to retrieve updated cart')
    }

    return cartWithItems
  }

  async updateCartById(id: string, updateCartDto: UpdateCartDto): Promise<Cart & { items: CartItemRecord[] }> {
    const existingCart = await this.cartRepository.findById(id)
    if (!existingCart) {
      throw new NotFoundException(`Cart with ID ${id} not found`)
    }

    // Clear existing items
    await this.cartRepository.deleteCartItemsByCartId(id)

    // Add new items
    if (updateCartDto.items && updateCartDto.items.length > 0) {
      for (const item of updateCartDto.items) {
        const newCartItem: NewCartItem = {
          cartId: id,
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          size: item.size,
          color: item.color,
          price: item.price.toString(),
          quantity: Math.min(item.quantity, item.maxStock),
          imageUrl: item.imageUrl,
          maxStock: item.maxStock,
        }
        await this.cartRepository.createCartItem(newCartItem)
      }
    }

    // Recalculate totals
    const { totalItems, totalPrice } = await this.cartRepository.calculateCartTotals(id)

    // Update cart totals
    const updatedCart = await this.cartRepository.update(id, {
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    // Return cart with items
    const cartWithItems = await this.cartRepository.findByIdWithItems(id)
    if (!cartWithItems) {
      throw new BadRequestException('Failed to retrieve updated cart')
    }

    return cartWithItems
  }
}
