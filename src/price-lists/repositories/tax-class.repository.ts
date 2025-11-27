import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { taxClasses, type TaxClass, type NewTaxClass } from '../../database/schemas';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class TaxClassRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(organizationId: number): Promise<TaxClass[]> {
    return await this.databaseService.db
      .select()
      .from(taxClasses)
      .where(eq(taxClasses.organizationId, organizationId))
      .orderBy(desc(taxClasses.isDefault), desc(taxClasses.createdAt));
  }

  async findById(id: number, organizationId: number): Promise<TaxClass | null> {
    const result = await this.databaseService.db
      .select()
      .from(taxClasses)
      .where(
        and(
          eq(taxClasses.id, id),
          eq(taxClasses.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async findByCode(code: string, organizationId: number): Promise<TaxClass | null> {
    const result = await this.databaseService.db
      .select()
      .from(taxClasses)
      .where(
        and(
          eq(taxClasses.code, code),
          eq(taxClasses.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async findDefault(organizationId: number): Promise<TaxClass | null> {
    const result = await this.databaseService.db
      .select()
      .from(taxClasses)
      .where(
        and(
          eq(taxClasses.organizationId, organizationId),
          eq(taxClasses.isDefault, true),
          eq(taxClasses.status, 'active'),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async create(data: NewTaxClass): Promise<TaxClass> {
    const result = await this.databaseService.db
      .insert(taxClasses)
      .values(data)
      .returning();

    return result[0];
  }

  async update(
    id: number,
    organizationId: number,
    data: Partial<NewTaxClass>,
  ): Promise<TaxClass> {
    const result = await this.databaseService.db
      .update(taxClasses)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(taxClasses.id, id),
          eq(taxClasses.organizationId, organizationId),
        ),
      )
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Tax class with ID ${id} not found`);
    }

    return result[0];
  }

  async delete(id: number, organizationId: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(taxClasses)
      .where(
        and(
          eq(taxClasses.id, id),
          eq(taxClasses.organizationId, organizationId),
        ),
      )
      .returning();

    return result.length > 0;
  }
}