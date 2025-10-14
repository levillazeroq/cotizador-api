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
import { PaymentMethodService } from './payment-method.service'
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto'
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto'
import { ReorderPaymentMethodsDto } from './dto/reorder-payment-methods.dto'
import { PaymentMethod } from '../database/schemas'

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.create(createPaymentMethodDto)
    return paymentMethod
  }

  @Get()
  async findAll(): Promise<PaymentMethod[]> {
    const paymentMethods = await this.paymentMethodService.findAll()
    return paymentMethods
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.findOne(id)
    return paymentMethod
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.update(id, updatePaymentMethodDto)
    return paymentMethod
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.paymentMethodService.remove(id)
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodService.toggleActive(id)
    return paymentMethod
  }

  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(@Body() reorderPaymentMethodsDto: ReorderPaymentMethodsDto): Promise<void> {
    await this.paymentMethodService.reorder(reorderPaymentMethodsDto)
  }
}
