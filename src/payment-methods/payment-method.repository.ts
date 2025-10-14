import { Injectable } from '@nestjs/common'
import { eq, asc } from 'drizzle-orm'
import { db } from '../database'
import { paymentMethods, type PaymentMethod, type NewPaymentMethod } from '../database/schemas'

@Injectable()
export class PaymentMethodRepository {
  async findAll(): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.createdAt))
  }

  async findById(id: string): Promise<PaymentMethod | null> {
    const result = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findByName(name: string): Promise<PaymentMethod | null> {
    const result = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.name, name))
      .limit(1)
    
    return result[0] || null
  }

  async create(paymentMethodData: NewPaymentMethod): Promise<PaymentMethod> {
    const result = await db
      .insert(paymentMethods)
      .values(paymentMethodData)
      .returning()
    
    return result[0]
  }

  async update(id: string, paymentMethodData: Partial<NewPaymentMethod>): Promise<PaymentMethod | null> {
    const result = await db
      .update(paymentMethods)
      .set({ ...paymentMethodData, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning()
    
    return result[0] || null
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(paymentMethods)
      .where(eq(paymentMethods.id, id))
    
    return result.length > 0
  }

  async toggleActive(id: string): Promise<PaymentMethod | null> {
    const paymentMethod = await this.findById(id)
    if (!paymentMethod) return null

    return await this.update(id, { isActive: !paymentMethod.isActive })
  }

  async reorderFields(fieldOrders: { id: string; sortOrder: number }[]): Promise<void> {
    for (const { id, sortOrder } of fieldOrders) {
      await db
        .update(paymentMethods)
        .set({ sortOrder, updatedAt: new Date() })
        .where(eq(paymentMethods.id, id))
    }
  }
}
