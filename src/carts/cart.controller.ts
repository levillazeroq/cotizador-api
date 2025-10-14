import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { CartService } from './cart.service'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartDto } from './dto/update-cart.dto'
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /cart - Get current cart
  @Get()
  async getCart() {
    const cart = await this.cartService.getCart()
    return {
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }

  // GET /cart/all - Get all carts (for quotes)
  @Get('all')
  async getAllCarts() {
    const carts = await this.cartService.getAllCarts()
    
    // Format response for quotes
    const quotes = carts.map(cart => ({
      id: cart.id,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      // Additional info for UI
      displayName: `Cotización #${cart.id.slice(-6)}`,
      lastUpdated: cart.updatedAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    return {
      quotes,
      total: quotes.length
    }
  }

  // GET /cart/:id - Get cart by ID
  @Get(':id')
  async getCartById(@Param('id') id: string) {
    const cart = await this.cartService.getCartById(id)
    return {
      id: cart.id,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }
  }

  // POST /cart - Add item to cart
  @Post()
  @HttpCode(HttpStatus.OK)
  async addItem(@Body() createCartItemDto: CreateCartItemDto) {
    const cart = await this.cartService.addItem(createCartItemDto)
    return {
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }

  // PUT /cart - Update entire cart
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateCart(@Body() updateCartDto: UpdateCartDto) {
    const cart = await this.cartService.updateCart(updateCartDto)
    return {
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }

  // DELETE /cart - Clear cart
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearCart() {
    const cart = await this.cartService.clearCart()
    return {
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }

  // PUT /cart/:id - Update cart by ID
  @Put(':id')
  async updateCartById(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    const cart = await this.cartService.updateCartById(id, updateCartDto)
    return {
      id: cart.id,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }
}

@Controller('cart/item')
export class CartItemController {
  constructor(private readonly cartService: CartService) {}

  // PUT /cart/item/:itemId - Update item quantity
  @Put(':itemId')
  @HttpCode(HttpStatus.OK)
  async updateItemQuantity(
    @Param('itemId') itemId: string,
    @Body() updateQuantityDto: UpdateCartItemQuantityDto
  ) {
    const cart = await this.cartService.updateItemQuantity(itemId, updateQuantityDto)
    return {
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }

  // DELETE /cart/item/:itemId - Remove item
  @Delete(':itemId')
  @HttpCode(HttpStatus.OK)
  async removeItem(@Param('itemId') itemId: string) {
    const cart = await this.cartService.removeItem(itemId)
    return {
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }
}
