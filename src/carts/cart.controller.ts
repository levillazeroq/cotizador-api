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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { PriceValidationService } from './services/price-validation.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCustomizationDto } from './dto/update-customization.dto';
import { AddPaymentProofDto } from './dto/responses/add-payment-proof.dto';
import { CreateProofPaymentDto } from '../payments/dto/create-proof-payment.dto';
import { CartResponseDto } from './dto/responses/cart-response.dto';
import { QuoteListItemDto } from './dto/responses/quote-list-item.dto';
import { ChangelogItemResponseDto } from './dto/responses/changelog-item-response.dto';
import { ErrorResponseDto } from './dto/responses/error-response.dto';
import { PaymentResponseDto } from '../payments/dto/payment-response.dto';

@ApiTags('carts')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly priceValidationService: PriceValidationService,
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

  @ApiOperation({
    summary: 'Agregar pago con comprobante al carrito',
    description:
      'Crea un pago con comprobante (cheque o transferencia) para el carrito. El archivo del comprobante se sube automáticamente a S3.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AddPaymentProofDto })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Post(':id/payment-proof')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async addPaymentWithProof(
    @Param('id') cartId: string,
    @Body() addPaymentProofDto: AddPaymentProofDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const payment = await this.cartService.addPaymentWithProof(
      cartId,
      { ...addPaymentProofDto, cartId },
      file,
    );

    return payment;
  }

  // ============= Quote Price Validation Endpoints =============

  @ApiOperation({
    summary: 'Activar cotización con fecha de expiración',
    description:
      'Convierte un carrito draft en una cotización activa con fecha de expiración. Por defecto, las cotizaciones son válidas por 7 días.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Cotización activada exitosamente' })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Post(':id/activate')
  async activateQuote(@Param('id') id: string) {
    const cart = await this.priceValidationService.activateQuote(id);
    return {
      id: cart.id,
      status: cart.status,
      validUntil: cart.validUntil,
      message: 'Cotización activada exitosamente',
    };
  }

  @ApiOperation({
    summary: 'Validar precios de la cotización',
    description:
      'Compara los precios actuales de los productos con los precios guardados en el carrito. Retorna información sobre cambios de precio si los hay.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Validación de precios completada',
    schema: {
      properties: {
        isValid: { type: 'boolean' },
        changes: {
          type: 'array',
          items: {
            properties: {
              itemId: { type: 'string' },
              productId: { type: 'string' },
              name: { type: 'string' },
              oldPrice: { type: 'number' },
              newPrice: { type: 'number' },
              difference: { type: 'number' },
              percentageChange: { type: 'number' },
            },
          },
        },
        totalOldPrice: { type: 'number' },
        totalNewPrice: { type: 'number' },
        totalDifference: { type: 'number' },
        totalPercentageChange: { type: 'number' },
        requiresApproval: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Post(':id/validate-prices')
  async validatePrices(@Param('id') id: string) {
    const validation = await this.priceValidationService.validateCartPrices(id);
    const requiresApproval = this.priceValidationService.requiresApproval(validation);

    return {
      ...validation,
      requiresApproval,
      message: validation.isValid
        ? 'Los precios no han cambiado'
        : `Se detectaron ${validation.changes.length} cambios de precio`,
    };
  }

  @ApiOperation({
    summary: 'Aprobar y aplicar cambios de precio',
    description:
      'Actualiza los precios del carrito a los precios actuales de los productos. Requiere que el cliente haya aprobado los cambios.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiBody({
    schema: {
      properties: {
        approved: {
          type: 'boolean',
          description: 'Confirmación del cliente de que aprueba los nuevos precios',
        },
      },
      required: ['approved'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Precios actualizados exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'El cliente debe aprobar los cambios de precio',
  })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Post(':id/approve-price-changes')
  async approvePriceChanges(
    @Param('id') id: string,
    @Body() body: { approved: boolean },
  ) {
    if (!body.approved) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'El cliente debe aprobar los cambios de precio',
        error: 'ApprovalRequired',
      };
    }

    // Get current validation
    const validation = await this.priceValidationService.validateCartPrices(id);

    if (validation.isValid) {
      return {
        message: 'No hay cambios de precio para aprobar',
        validation,
      };
    }

    // Update prices
    const updatedCart = await this.priceValidationService.updateCartPrices(
      id,
      validation.changes,
    );

    return {
      message: 'Precios actualizados exitosamente',
      cart: {
        id: updatedCart.id,
        totalPrice: parseFloat(updatedCart.totalPrice as string),
        priceValidatedAt: updatedCart.priceValidatedAt,
        priceChangeApproved: updatedCart.priceChangeApproved,
      },
      changes: validation.changes,
    };
  }

  @ApiOperation({
    summary: 'Validación completa pre-pago',
    description:
      'Realiza todas las validaciones necesarias antes de procesar un pago: expiración, estado de la cotización y precios. Si los cambios son menores, se aplican automáticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del carrito',
    example: 'cart_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Validación exitosa, listo para procesar pago',
  })
  @ApiResponse({
    status: 409,
    description: 'Los precios han cambiado y requieren aprobación del cliente',
  })
  @ApiResponse({
    status: 410,
    description: 'La cotización ha expirado',
  })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  @Post(':id/validate-before-payment')
  async validateBeforePayment(@Param('id') id: string) {
    const result = await this.priceValidationService.validateBeforePayment(id);

    return {
      message: 'Validación completada exitosamente',
      isValid: result.validation.isValid,
      requiresApproval: result.requiresApproval,
      cart: {
        id: result.cart.id,
        status: result.cart.status,
        totalPrice: parseFloat(result.cart.totalPrice as string),
        validUntil: result.cart.validUntil,
      },
      validation: result.validation,
    };
  }

}
