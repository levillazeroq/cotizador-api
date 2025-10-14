import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PaymentMethodRepository } from './payment-method.repository'
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto'
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto'
import { ReorderPaymentMethodsDto } from './dto/reorder-payment-methods.dto'
import { PaymentMethod } from '../database/schemas'

@Injectable()
export class PaymentMethodService {
  constructor(private readonly paymentMethodRepository: PaymentMethodRepository) {}

  async findAll(): Promise<PaymentMethod[]> {
    return await this.paymentMethodRepository.findAll()
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findById(id)
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }
    return paymentMethod
  }

  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    // Check if payment method with same name already exists
    const existingPaymentMethod = await this.paymentMethodRepository.findByName(createPaymentMethodDto.name)
    if (existingPaymentMethod) {
      throw new ConflictException(`Payment method with name '${createPaymentMethodDto.name}' already exists`)
    }

    return await this.paymentMethodRepository.create({
      name: createPaymentMethodDto.name,
      type: createPaymentMethodDto.type,
      displayName: createPaymentMethodDto.displayName,
      icon: createPaymentMethodDto.icon,
      isActive: createPaymentMethodDto.isActive ?? true,
      requiresProof: createPaymentMethodDto.requiresProof ?? false,
      sortOrder: createPaymentMethodDto.sortOrder ?? 0,
    })
  }

  async update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const existingPaymentMethod = await this.paymentMethodRepository.findById(id)
    if (!existingPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }

    // Check if name is being changed and if new name already exists
    if (updatePaymentMethodDto.name && updatePaymentMethodDto.name !== existingPaymentMethod.name) {
      const paymentMethodWithSameName = await this.paymentMethodRepository.findByName(updatePaymentMethodDto.name)
      if (paymentMethodWithSameName) {
        throw new ConflictException(`Payment method with name '${updatePaymentMethodDto.name}' already exists`)
      }
    }

    const updatedPaymentMethod = await this.paymentMethodRepository.update(id, updatePaymentMethodDto)
    if (!updatedPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }

    return updatedPaymentMethod
  }

  async remove(id: string): Promise<void> {
    const existingPaymentMethod = await this.paymentMethodRepository.findById(id)
    if (!existingPaymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }

    const deleted = await this.paymentMethodRepository.delete(id)
    if (!deleted) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }
  }

  async toggleActive(id: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.toggleActive(id)
    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`)
    }
    return paymentMethod
  }

  async reorder(reorderPaymentMethodsDto: ReorderPaymentMethodsDto): Promise<void> {
    await this.paymentMethodRepository.reorderFields(reorderPaymentMethodsDto.fieldOrders)
  }
}
