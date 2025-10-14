import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { CartRepository } from './cart.repository'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartDto } from './dto/update-cart.dto'
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto'
import { Cart, CartItem } from '../database/schemas'

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(): Promise<Cart> {
    let cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      // Create empty cart if none exists
      cart = await this.cartRepository.create({
        items: [],
        totalItems: 0,
        totalPrice: '0',
      })
    }

    return cart
  }

  async getAllCarts(): Promise<Cart[]> {
    return await this.cartRepository.findAll()
  }

  async getCartById(id: string): Promise<Cart> {
    const cart = await this.cartRepository.findById(id)
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`)
    }
    return cart
  }

  async addItem(createCartItemDto: CreateCartItemDto): Promise<Cart> {
    let cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      // Create cart if none exists
      cart = await this.cartRepository.create({
        items: [],
        totalItems: 0,
        totalPrice: '0',
      })
    }

    const currentItems = cart.items || []
    
    // Check if item already exists
    const existingItemIndex = currentItems.findIndex(
      (item: CartItem) => item.productId === createCartItemDto.productId
    )

    let updatedItems: CartItem[]

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      updatedItems = [...currentItems]
      const existingItem = updatedItems[existingItemIndex]
      const newQuantity = Math.min(existingItem.quantity + createCartItemDto.quantity, createCartItemDto.maxStock)
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
      }
    } else {
      // Add new item with unique ID
      const newItem: CartItem = {
        id: `${createCartItemDto.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: createCartItemDto.productId,
        name: createCartItemDto.name,
        sku: createCartItemDto.sku,
        size: createCartItemDto.size,
        color: createCartItemDto.color,
        price: createCartItemDto.price,
        quantity: Math.min(createCartItemDto.quantity, createCartItemDto.maxStock),
        imageUrl: createCartItemDto.imageUrl,
        maxStock: createCartItemDto.maxStock,
      }
      updatedItems = [...currentItems, newItem]
    }

    // Calculate totals
    const { totalItems, totalPrice } = this.cartRepository.calculateTotals(updatedItems)

    // Update cart
    const updatedCart = await this.cartRepository.updateFirst({
      items: updatedItems,
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    return updatedCart
  }

  async updateItemQuantity(productId: string, updateQuantityDto: UpdateCartItemQuantityDto): Promise<Cart> {
    const cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      throw new NotFoundException('Cart not found')
    }

    const currentItems = cart.items || []
    const itemIndex = currentItems.findIndex((item: CartItem) => item.productId === productId)
    
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart')
    }

    let updatedItems: CartItem[]

    if (updateQuantityDto.quantity === 0) {
      // Remove item if quantity is 0
      updatedItems = currentItems.filter((_, index) => index !== itemIndex)
    } else {
      // Update quantity
      updatedItems = [...currentItems]
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: Math.min(updateQuantityDto.quantity, updatedItems[itemIndex].maxStock),
      }
    }

    // Calculate totals
    const { totalItems, totalPrice } = this.cartRepository.calculateTotals(updatedItems)

    // Update cart
    const updatedCart = await this.cartRepository.updateFirst({
      items: updatedItems,
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    return updatedCart
  }

  async removeItem(productId: string): Promise<Cart> {
    const cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      throw new NotFoundException('Cart not found')
    }

    const currentItems = cart.items || []
    const itemIndex = currentItems.findIndex((item: CartItem) => item.productId === productId)
    
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart')
    }

    // Remove item from array
    const updatedItems = currentItems.filter((_, index) => index !== itemIndex)

    // Calculate totals
    const { totalItems, totalPrice } = this.cartRepository.calculateTotals(updatedItems)

    // Update cart
    const updatedCart = await this.cartRepository.updateFirst({
      items: updatedItems,
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    return updatedCart
  }

  async updateCart(updateCartDto: UpdateCartDto): Promise<Cart> {
    let cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      // Create cart if none exists
      const items = (updateCartDto.items || []).map(item => ({
        ...item,
        id: `${item.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
      cart = await this.cartRepository.create({
        items,
        totalItems: 0,
        totalPrice: '0',
      })
    } else {
      // Update existing cart
      const items = updateCartDto.items 
        ? updateCartDto.items.map(item => ({
            ...item,
            id: `${item.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }))
        : cart.items
      const { totalItems, totalPrice } = this.cartRepository.calculateTotals(items)

      const updatedCart = await this.cartRepository.updateFirst({
        items,
        totalItems,
        totalPrice,
      })

      if (!updatedCart) {
        throw new BadRequestException('Failed to update cart')
      }

      cart = updatedCart
    }

    return cart
  }

  async clearCart(): Promise<Cart> {
    let cart = await this.cartRepository.findFirst()
    
    if (!cart) {
      // Create empty cart if none exists
      cart = await this.cartRepository.create({
        items: [],
        totalItems: 0,
        totalPrice: '0',
      })
    } else {
      // Clear existing cart
      const clearedCart = await this.cartRepository.clearFirst()
      if (!clearedCart) {
        throw new BadRequestException('Failed to clear cart')
      }
      cart = clearedCart
    }

    return cart
  }

  async updateCartById(id: string, updateCartDto: UpdateCartDto): Promise<Cart> {
    const existingCart = await this.cartRepository.findById(id)
    if (!existingCart) {
      throw new NotFoundException(`Cart with ID ${id} not found`)
    }

    const items = updateCartDto.items 
      ? updateCartDto.items.map(item => ({
          ...item,
          id: `${item.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      : existingCart.items
    const { totalItems, totalPrice } = this.cartRepository.calculateTotals(items)

    const updatedCart = await this.cartRepository.update(id, {
      items,
      totalItems,
      totalPrice,
    })

    if (!updatedCart) {
      throw new BadRequestException('Failed to update cart')
    }

    return updatedCart
  }
}
