import { Injectable } from '@nestjs/common'
import { eq, asc, and } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { customizationFields, type CustomizationField, type NewCustomizationField } from '../database/schemas'

@Injectable()
export class CustomizationFieldRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<CustomizationField[]> {
    return await this.databaseService.db
      .select()
      .from(customizationFields)
      .orderBy(asc(customizationFields.sortOrder), asc(customizationFields.createdAt))
  }

  async findById(id: string): Promise<CustomizationField | null> {
    const result = await this.databaseService.db
      .select()
      .from(customizationFields)
      .where(eq(customizationFields.id, id))
      .limit(1)

    return result[0] || null
  }

  async create(data: NewCustomizationField): Promise<CustomizationField> {
    const result = await this.databaseService.db
      .insert(customizationFields)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return result[0]
  }

  async update(id: string, data: Partial<NewCustomizationField>): Promise<CustomizationField> {
    const result = await this.databaseService.db
      .update(customizationFields)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(customizationFields.id, id))
      .returning()

    return result[0]
  }

  async delete(id: string): Promise<void> {
    await this.databaseService.db
      .delete(customizationFields)
      .where(eq(customizationFields.id, id))
  }

  async toggleActive(id: string): Promise<CustomizationField> {
    const field = await this.findById(id)
    if (!field) {
      throw new Error('Customization field not found')
    }

    return await this.update(id, { isActive: !field.isActive })
  }

  async reorder(fieldOrders: { id: string; sortOrder: number }[]): Promise<void> {
    for (const { id, sortOrder } of fieldOrders) {
      await this.databaseService.db
        .update(customizationFields)
        .set({
          sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(customizationFields.id, id))
    }
  }
}
