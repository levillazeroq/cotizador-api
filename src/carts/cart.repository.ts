import { Injectable } from '@nestjs/common'
import { eq, desc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { carts, type Cart, type NewCart, type CartItem } from '../database/schemas'

@Injectable()
export class CartRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<Cart[]> {
    return await this.databaseService.db
      .select()
      .from(carts)
      .orderBy(desc(carts.updatedAt))
  }

  async findById(id: string): Promise<Cart | null> {
    const result = await this.databaseService.db
      .select()
      .from(carts)
      .where(eq(carts.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findFirst(): Promise<Cart | null> {
    const result = await this.databaseService.db
      .select()
      .from(carts)
      .limit(1)
    
    return result[0] || null
  }

  async create(newCart: NewCart): Promise<Cart> {
    const result = await this.databaseService.db
      .insert(carts)
      .values(newCart)
      .returning()
    
    return result[0]
  }

  async update(id: string, updateData: Partial<Cart>): Promise<Cart | null> {
    const result = await this.databaseService.db
      .update(carts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, id))
      .returning()
    
    return result[0] || null
  }

  async updateFirst(updateData: Partial<Cart>): Promise<Cart | null> {
    // Get the first cart
    const firstCart = await this.findFirst()
    if (!firstCart) {
      return null
    }

    return await this.update(firstCart.id, updateData)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(carts)
      .where(eq(carts.id, id))
      .returning()
    
    return result.length > 0
  }

  async clearFirst(): Promise<Cart | null> {
    return await this.updateFirst({
      items: [],
      totalItems: 0,
      totalPrice: '0',
    })
  }

  // Helper methods for cart calculations
  calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: string } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    return {
      totalItems,
      totalPrice: totalPrice.toString(),
    }
  }
}
