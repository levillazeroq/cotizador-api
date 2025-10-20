import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { PaymentMethodService } from './payment-method.service'
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto'
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto'
import { ReorderPaymentMethodsDto } from './dto/reorder-payment-methods.dto'
import { PaymentMethod } from '../database/schemas'

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @ApiOperation({
    summary: 'Crear nuevo método de pago',
    description: 'Registra un nuevo método de pago en el sistema. Puede incluir configuraciones específicas como cuotas, descuentos y recargos.',
  })
  @ApiBody({
    type: CreatePaymentMethodDto,
    description: 'Datos del método de pago a crear',
    examples: {
      creditCard: {
        summary: 'Tarjeta de Crédito',
        value: {
          name: 'Tarjeta de Crédito',
          type: 'credit_card',
          description: 'Pago con tarjetas Visa, Mastercard, AMEX',
          isActive: true,
          displayOrder: 1,
          maxInstallments: 12,
          installmentInterest: 2.5,
        },
      },
      bankTransfer: {
        summary: 'Transferencia Bancaria',
        value: {
          name: 'Transferencia Bancaria',
          type: 'bank_transfer',
          description: 'Transferencia directa a cuenta bancaria',
          isActive: true,
          displayOrder: 2,
          discount: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Método de pago creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'pm_123456' },
        name: { type: 'string', example: 'Tarjeta de Crédito' },
        type: { type: 'string', example: 'credit_card', enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'digital_wallet'] },
        description: { type: 'string', example: 'Pago con tarjetas Visa, Mastercard, AMEX' },
        isActive: { type: 'boolean', example: true },
        displayOrder: { type: 'number', example: 1 },
        maxInstallments: { type: 'number', example: 12 },
        installmentInterest: { type: 'number', example: 2.5 },
        discount: { type: 'number', example: 0 },
        surcharge: { type: 'number', example: 0 },
        icon: { type: 'string', example: 'credit-card-icon.svg' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error de validación',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.create(createPaymentMethodDto)
    return paymentMethod
  }

  @ApiOperation({
    summary: 'Obtener todos los métodos de pago',
    description: 'Retorna una lista completa de todos los métodos de pago configurados en el sistema, incluyendo activos e inactivos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de métodos de pago obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'pm_123456' },
          name: { type: 'string', example: 'Tarjeta de Crédito' },
          type: { type: 'string', example: 'credit_card' },
          description: { type: 'string', example: 'Pago con tarjetas principales' },
          isActive: { type: 'boolean', example: true },
          displayOrder: { type: 'number', example: 1 },
          maxInstallments: { type: 'number', example: 12 },
          installmentInterest: { type: 'number', example: 2.5 },
          discount: { type: 'number', example: 0 },
          surcharge: { type: 'number', example: 0 },
        },
      },
    },
  })
  @Get()
  async findAll(): Promise<PaymentMethod[]> {
    const paymentMethods = await this.paymentMethodService.findAll()
    return paymentMethods
  }

  @ApiOperation({
    summary: 'Obtener método de pago por ID',
    description: 'Retorna un método de pago específico con todos sus detalles y configuraciones.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del método de pago',
    example: 'pm_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Método de pago obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'pm_123456' },
        name: { type: 'string', example: 'Tarjeta de Crédito' },
        type: { type: 'string', example: 'credit_card' },
        description: { type: 'string', example: 'Pago con tarjetas principales' },
        isActive: { type: 'boolean', example: true },
        displayOrder: { type: 'number', example: 1 },
        maxInstallments: { type: 'number', example: 12 },
        installmentInterest: { type: 'number', example: 2.5 },
        discount: { type: 'number', example: 0 },
        surcharge: { type: 'number', example: 0 },
        icon: { type: 'string', example: 'credit-card-icon.svg' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Método de pago no encontrado',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.findOne(id)
    return paymentMethod
  }

  @ApiOperation({
    summary: 'Actualizar método de pago',
    description: 'Actualiza parcialmente un método de pago existente. Solo los campos proporcionados serán actualizados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del método de pago a actualizar',
    example: 'pm_123456',
    type: String,
  })
  @ApiBody({
    type: UpdatePaymentMethodDto,
    description: 'Datos a actualizar del método de pago',
  })
  @ApiResponse({
    status: 200,
    description: 'Método de pago actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'pm_123456' },
        name: { type: 'string', example: 'Tarjeta de Crédito Actualizado' },
        maxInstallments: { type: 'number', example: 18 },
        installmentInterest: { type: 'number', example: 3.0 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Método de pago no encontrado',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.update(id, updatePaymentMethodDto)
    return paymentMethod
  }

  @ApiOperation({
    summary: 'Eliminar método de pago',
    description: 'Elimina permanentemente un método de pago del sistema. ADVERTENCIA: esto puede afectar cotizaciones existentes que usen este método.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del método de pago a eliminar',
    example: 'pm_123456',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Método de pago eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Método de pago no encontrado',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.paymentMethodService.remove(id)
  }

  @ApiOperation({
    summary: 'Activar/Desactivar método de pago',
    description: 'Alterna el estado activo/inactivo de un método de pago. Los métodos inactivos no están disponibles para nuevas cotizaciones.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del método de pago',
    example: 'pm_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del método de pago actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'pm_123456' },
        name: { type: 'string', example: 'Tarjeta de Crédito' },
        isActive: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Método de pago no encontrado',
  })
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.toggleActive(id)
    return paymentMethod
  }

  @ApiOperation({
    summary: 'Reordenar métodos de pago',
    description: 'Actualiza el orden de visualización de múltiples métodos de pago. El orden determina la prioridad de presentación en la interfaz.',
  })
  @ApiBody({
    type: ReorderPaymentMethodsDto,
    description: 'Array con los IDs de los métodos de pago en el nuevo orden deseado',
    schema: {
      type: 'object',
      properties: {
        order: {
          type: 'array',
          items: { type: 'string' },
          example: ['pm_456', 'pm_123', 'pm_789'],
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Métodos de pago reordenados exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de reordenamiento',
  })
  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(@Body() reorderPaymentMethodsDto: ReorderPaymentMethodsDto): Promise<void> {
    await this.paymentMethodService.reorder(reorderPaymentMethodsDto)
  }
}
