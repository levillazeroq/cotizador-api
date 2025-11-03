import { Injectable } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { payments, Payment, NewPayment, PaymentStatus } from '../database/schemas';

@Injectable()
export class PaymentRepository {
  constructor(private databaseService: DatabaseService) {}

  async create(data: NewPayment): Promise<Payment> {
    const [payment] = await this.databaseService.db
      .insert(payments)
      .values(data)
      .returning();
    return payment;
  }

  async findById(id: string): Promise<Payment | undefined> {
    const [payment] = await this.databaseService.db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    return payment;
  }

  async findByCartId(cartId: string): Promise<Payment[]> {
    return await this.databaseService.db
      .select()
      .from(payments)
      .where(eq(payments.cartId, cartId))
      .orderBy(desc(payments.createdAt));
  }

  async findByTransactionId(transactionId: string): Promise<Payment | undefined> {
    const [payment] = await this.databaseService.db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, transactionId));
    return payment;
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return await this.databaseService.db
      .select()
      .from(payments)
      .where(eq(payments.status, status))
      .orderBy(desc(payments.createdAt));
  }

  async findAll(): Promise<Payment[]> {
    return await this.databaseService.db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }

  async update(
    id: string,
    data: Partial<NewPayment>,
  ): Promise<Payment | undefined> {
    const [payment] = await this.databaseService.db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Payment | undefined> {
    const updateData: Partial<NewPayment> = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'completed') {
      updateData.confirmedAt = new Date();
      updateData.paymentDate = new Date();
    }

    const [payment] = await this.databaseService.db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async uploadProof(
    id: string,
    proofUrl: string,
    notes?: string,
  ): Promise<Payment | undefined> {
    const updateData: Partial<NewPayment> = {
      proofUrl,
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    const [payment] = await this.databaseService.db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();
    return result.length > 0;
  }

  async getPaymentStats(cartId: string): Promise<{
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    count: number;
  }> {
    const cartPayments = await this.findByCartId(cartId);

    const stats = cartPayments.reduce(
      (acc, payment) => {
        const amount = parseFloat(payment.amount);
        acc.count++;

        if (payment.status === 'completed') {
          acc.totalPaid += amount;
        } else if (payment.status === 'pending' || payment.status === 'processing') {
          acc.totalPending += amount;
        } else if (payment.status === 'failed') {
          acc.totalFailed += amount;
        }

        return acc;
      },
      { totalPaid: 0, totalPending: 0, totalFailed: 0, count: 0 },
    );

    return stats;
  }
}

