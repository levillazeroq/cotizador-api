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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCustomizationDto } from './dto/update-customization.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { QuoteListItemDto } from './dto/quote-list-item.dto';
import { ChangelogItemResponseDto } from './dto/changelog-item-response.dto';
import { ErrorResponseDto } from './dto/error-response.dto';

@ApiTags('carts')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @ApiOperation({
    summary: 'Obtener todas las cotizaciones',
    description:
      'Retorna una lista de todos los carritos (cotizaciones) con información resumida para mostrar en la interfaz de cotizaciones',
  })
  @ApiResponse({ status: 200, type: [QuoteListItemDto] })
  @Get()
  async getAllCarts() {
    const carts = await this.cartService.getAllCarts();

    // Format response for quotes
    const quotes = carts.map((cart) => ({
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
        minute: '2-digit',
      }),
    }));

    return quotes;
  }

  @ApiOperation({
    summary: 'Obtener carrito por conversation ID',
    description:
      'Busca y retorna un carrito específico asociado a un conversation_id. Retorna el carrito con todos sus items.',
  })
  @ApiParam({
    name: 'conversationId',
    description: 'ID de la conversación',
    type: String,
    example: 'conv_abc123xyz',
  })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Get('conversation/:conversationId')
  async getCartByConversationId(
    @Param('conversationId') conversationId: string,
  ) {
    const cart = await this.cartService.getCartByConversationId(conversationId);
    return cart;
  }

  @ApiOperation({
    summary: 'Obtener carrito por ID',
    description:
      'Retorna un carrito específico con todos sus items y detalles completos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Get(':id')
  async getCartById(@Param('id') id: string) {
    const cart = await this.cartService.getCartById(id);
    return cart;
  }

  @ApiOperation({
    summary: 'Crear nuevo carrito',
    description:
      'Crea un nuevo carrito asociado a una conversación. Opcionalmente puede incluir items iniciales.',
  })
  @ApiResponse({ status: 201, type: CartResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCart(@Body() createCartDto: CreateCartDto) {
    const cart = await this.cartService.createCart(createCartDto);
    return {
      id: cart.id,
      conversationId: cart.conversationId,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  @ApiOperation({
    summary: 'Actualizar carrito por ID',
    description:
      'Actualiza un carrito específico reemplazando todos sus items con los nuevos items proporcionados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito a actualizar',
    example: 'cart_123456',
    type: String,
  })
  @ApiBody({ type: UpdateCartDto })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @Put(':id')
  async updateCartById(
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    const cart = await this.cartService.updateCartById(id, updateCartDto);
    return {
      id: cart.id,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    };
  }

  @ApiOperation({
    summary: 'Actualizar personalización de productos en el carrito',
    description:
      'Actualiza los valores de personalización para los productos seleccionados en un carrito.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiBody({ type: UpdateCustomizationDto })
  @ApiResponse({ status: 200, type: CartResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Patch(':id/customization')
  async updateCustomization(
    @Param('id') id: string,
    @Body() updateCustomizationDto: UpdateCustomizationDto,
  ) {
    const cart = await this.cartService.updateCustomization(
      id,
      updateCustomizationDto,
    );
    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        ...item,
        price: parseFloat(item.price.toString()),
      })),
      totalItems: cart.totalItems,
      totalPrice: parseFloat(cart.totalPrice),
    };
  }

  @ApiOperation({
    summary: 'Obtener historial de cambios del carrito',
    description:
      'Retorna el historial completo de todos los cambios realizados en el carrito (items agregados y eliminados).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiResponse({ status: 200, type: [ChangelogItemResponseDto] })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Get(':id/changelog')
  async getCartChangelog(@Param('id') id: string) {
    return await this.cartService.getCartChangelog(id);
  }
}
