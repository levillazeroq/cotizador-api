import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { CartService } from './cart.service'
import { CreateCartDto } from './dto/create-cart.dto'
import { UpdateCartDto } from './dto/update-cart.dto'
import { UpdateCustomizationDto } from './dto/update-customization.dto'

@ApiTags('carts')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({
    summary: 'Obtener todas las cotizaciones',
    description: 'Retorna una lista de todos los carritos (cotizaciones) con información resumida para mostrar en la interfaz de cotizaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cotizaciones obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cart_123456' },
          totalItems: { type: 'number', example: 3 },
          totalPrice: { type: 'number', example: 1349990 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          displayName: { type: 'string', example: 'Cotización #123456' },
          lastUpdated: { type: 'string', example: '15 dic 2024, 14:30' },
        },
      },
    },
  })
  @Get()
  async getAllCarts() {
    const carts = await this.cartService.getAllCarts()
    
    // Format response for quotes
    const quotes = carts.map(cart => ({
      id: cart.id,
      conversationId: cart.conversationId,
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

    return quotes
  }

  @ApiOperation({
    summary: 'Obtener carrito por conversation ID',
    description: 'Busca y retorna un carrito específico asociado a un conversation_id. Retorna el carrito con todos sus items.',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID de la conversación',
    type: String,
    example: 'conv_abc123xyz',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito encontrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cart_123456' },
        conversationId: { type: 'string', example: 'conv_abc123xyz' },
        items: { type: 'array', items: {} },
        totalItems: { type: 'number', example: 3 },
        totalPrice: { type: 'number', example: 150000 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Carrito no encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Cart with conversation ID conv_abc123xyz not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @Get('conversation/:conversationId')
  async getCartByConversationId(@Param('conversationId') conversationId: string) {
    const cart = await this.cartService.getCartByConversationId(conversationId)
    return {
      id: cart.id,
      conversationId: cart.conversationId,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }
  }

  @ApiOperation({
    summary: 'Obtener carrito por ID',
    description: 'Retorna un carrito específico con todos sus items y detalles completos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cart_123456' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'item_789' },
              cartId: { type: 'string', example: 'cart_123456' },
              productId: { type: 'string', example: 'prod_123456' },
              name: { type: 'string', example: 'Laptop Dell XPS 13' },
              sku: { type: 'string', example: 'DELL-XPS13-2024' },
              size: { type: 'string', example: '13 pulgadas' },
              color: { type: 'string', example: 'Plata' },
              price: { type: 'number', example: 1299990 },
              quantity: { type: 'number', example: 1 },
              imageUrl: { type: 'string', example: 'https://example.com/images/laptop.jpg' },
              maxStock: { type: 'number', example: 10 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        totalItems: { type: 'number', example: 3 },
        totalPrice: { type: 'number', example: 1349990 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Carrito no encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Cart with ID cart_123456 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
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

  @ApiOperation({
    summary: 'Crear nuevo carrito',
    description: 'Crea un nuevo carrito asociado a una conversación. Opcionalmente puede incluir items iniciales.',
  })
  @ApiResponse({
    status: 201,
    description: 'Carrito creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cart_123456' },
        conversationId: { type: 'string', example: 'conv_abc123xyz' },
        items: { type: 'array', items: {} },
        totalItems: { type: 'number', example: 0 },
        totalPrice: { type: 'number', example: 0 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear el carrito',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Failed to create cart' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCart(@Body() createCartDto: CreateCartDto) {
    const cart = await this.cartService.createCart(createCartDto)
    return {
      id: cart.id,
      conversationId: cart.conversationId,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }
  }


  @ApiOperation({
    summary: 'Actualizar carrito por ID',
    description: 'Actualiza un carrito específico reemplazando todos sus items con los nuevos items proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito a actualizar',
    example: 'cart_123456',
    type: String,
  })
  @ApiBody({
    type: UpdateCartDto,
    description: 'Datos del carrito a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cart_123456' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'item_789' },
              cartId: { type: 'string', example: 'cart_123456' },
              productId: { type: 'string', example: 'prod_123456' },
              name: { type: 'string', example: 'Laptop Dell XPS 13' },
              sku: { type: 'string', example: 'DELL-XPS13-2024' },
              size: { type: 'string', example: '13 pulgadas' },
              color: { type: 'string', example: 'Plata' },
              price: { type: 'number', example: 1299990 },
              quantity: { type: 'number', example: 1 },
              imageUrl: { type: 'string', example: 'https://example.com/images/laptop.jpg' },
              maxStock: { type: 'number', example: 10 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        totalItems: { type: 'number', example: 3 },
        totalPrice: { type: 'number', example: 1349990 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Carrito no encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Cart with ID cart_123456 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la validación de datos o fallo al actualizar el carrito',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Failed to update cart' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
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

  @ApiOperation({
    summary: 'Actualizar personalización de productos en el carrito',
    description: 'Actualiza los valores de personalización para los productos seleccionados en un carrito.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiBody({
    type: UpdateCustomizationDto,
    description: 'Datos de personalización a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Personalización actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'cart_123456' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'item_789' },
              productId: { type: 'string', example: 'prod_123456' },
              name: { type: 'string', example: 'Laptop Dell XPS 13' },
              customizationValues: {
                type: 'object',
                example: {
                  'field-1': 'Logo personalizado',
                  'field-2': 'Azul',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Carrito no encontrado',
  })
  @Patch(':id/customization')
  async updateCustomization(
    @Param('id') id: string,
    @Body() updateCustomizationDto: UpdateCustomizationDto,
  ) {
    const cart = await this.cartService.updateCustomization(id, updateCustomizationDto)
    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        ...item,
        price: parseFloat(item.price.toString()),
      })),
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    }
  }
}
