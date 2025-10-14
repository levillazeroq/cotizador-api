import { Injectable } from '@nestjs/common'
import { eq, asc } from 'drizzle-orm'
import { DatabaseService } from '../database/database.service'
import { customizationGroups, type CustomizationGroup, type NewCustomizationGroup } from '../database/schemas'

@Injectable()
export class CustomizationGroupRepository {
  constructor(private readonly databaseService: DatabaseService) {}
  async findAll(): Promise<CustomizationGroup[]> {
    return await this.databaseService.db
      .select()
      .from(customizationGroups)
      .orderBy(asc(customizationGroups.sortOrder), asc(customizationGroups.createdAt))
  }

  async findById(id: string): Promise<CustomizationGroup | null> {
    const result = await this.databaseService.db
      .select()
      .from(customizationGroups)
      .where(eq(customizationGroups.id, id))
      .limit(1)
    
    return result[0] || null
  }

  async findByName(name: string): Promise<CustomizationGroup | null> {
    const result = await this.databaseService.db
      .select()
      .from(customizationGroups)
      .where(eq(customizationGroups.name, name))
      .limit(1)
    
    return result[0] || null
  }

  async findActive(): Promise<CustomizationGroup[]> {
    return await this.databaseService.db
      .select()
      .from(customizationGroups)
      .where(eq(customizationGroups.isActive, true))
      .orderBy(asc(customizationGroups.sortOrder))
  }

  async create(groupData: NewCustomizationGroup): Promise<CustomizationGroup> {
    const result = await this.databaseService.db
      .insert(customizationGroups)
      .values(groupData)
      .returning()
    
    return result[0]
  }

  async update(id: string, groupData: Partial<NewCustomizationGroup>): Promise<CustomizationGroup | null> {
    const result = await this.databaseService.db
      .update(customizationGroups)
      .set({ ...groupData, updatedAt: new Date() })
      .where(eq(customizationGroups.id, id))
      .returning()
    
    return result[0] || null
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(customizationGroups)
      .where(eq(customizationGroups.id, id))
    
    return result.length > 0
  }

  async toggleActive(id: string): Promise<CustomizationGroup | null> {
    const group = await this.findById(id)
    if (!group) return null

    return await this.update(id, { isActive: !group.isActive })
  }

  async reorderGroups(groupOrders: { id: string; sortOrder: number }[]): Promise<void> {
    for (const { id, sortOrder } of groupOrders) {
      await this.databaseService.db
        .update(customizationGroups)
        .set({ sortOrder, updatedAt: new Date() })
        .where(eq(customizationGroups.id, id))
    }
  }
}
