import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  priceListConditions,
  type PriceListCondition,
  type NewPriceListCondition,
} from '../../database/schemas';
import { eq, and, desc, inArray } from 'drizzle-orm';

/**
 * Filtra los campos obsoletos de una condición
 */
function sanitizeCondition(condition: any): PriceListCondition {
  const {
    name,
    description,
    priority,
    discountType,
    discountValue,
    ...validFields
  } = condition;
  
  return validFields as PriceListCondition;
}

@Injectable()
export class PriceListConditionRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    priceListId: number,
    organizationId: number,
  ): Promise<PriceListCondition[]> {
    const results = await this.databaseService.db
      .select()
      .from(priceListConditions)
      .where(
        and(
          eq(priceListConditions.priceListId, priceListId),
          eq(priceListConditions.organizationId, organizationId),
        ),
      )
      .orderBy(priceListConditions.createdAt);
    
    return results.map(sanitizeCondition);
  }

  async findActive(
    priceListId: number,
    organizationId: number,
  ): Promise<PriceListCondition[]> {
    const results = await this.databaseService.db
      .select()
      .from(priceListConditions)
      .where(
        and(
          eq(priceListConditions.priceListId, priceListId),
          eq(priceListConditions.organizationId, organizationId),
          eq(priceListConditions.status, 'active'),
        ),
      )
      .orderBy(priceListConditions.createdAt);
    
    return results.map(sanitizeCondition);
  }

  async findById(
    id: number,
    organizationId: number,
  ): Promise<PriceListCondition | null> {
    const result = await this.databaseService.db
      .select()
      .from(priceListConditions)
      .where(
        and(
          eq(priceListConditions.id, id),
          eq(priceListConditions.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] ? sanitizeCondition(result[0]) : null;
  }

  async findByPriceListIds(
    priceListIds: number[],
    organizationId: number,
  ): Promise<PriceListCondition[]> {
    if (priceListIds.length === 0) {
      return [];
    }

    const results = await this.databaseService.db
      .select()
      .from(priceListConditions)
      .where(
        and(
          inArray(priceListConditions.priceListId, priceListIds),
          eq(priceListConditions.organizationId, organizationId),
          eq(priceListConditions.status, 'active'),
        ),
      )
      .orderBy(priceListConditions.createdAt);
    
    return results.map(sanitizeCondition);
  }

  async create(data: NewPriceListCondition): Promise<PriceListCondition> {
    const result = await this.databaseService.db
      .insert(priceListConditions)
      .values(data)
      .returning();

    return sanitizeCondition(result[0]);
  }

  async update(
    id: number,
    organizationId: number,
    data: Partial<NewPriceListCondition>,
  ): Promise<PriceListCondition> {
    const result = await this.databaseService.db
      .update(priceListConditions)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(priceListConditions.id, id),
          eq(priceListConditions.organizationId, organizationId),
        ),
      )
      .returning();

    if (!result[0]) {
      throw new NotFoundException(
        `Price list condition with ID ${id} not found`,
      );
    }

    return sanitizeCondition(result[0]);
  }

  async delete(id: number, organizationId: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(priceListConditions)
      .where(
        and(
          eq(priceListConditions.id, id),
          eq(priceListConditions.organizationId, organizationId),
        ),
      )
      .returning();

    return result.length > 0;
  }

  async deleteByPriceListId(
    priceListId: number,
    organizationId: number,
  ): Promise<number> {
    const result = await this.databaseService.db
      .delete(priceListConditions)
      .where(
        and(
          eq(priceListConditions.priceListId, priceListId),
          eq(priceListConditions.organizationId, organizationId),
        ),
      )
      .returning();

    return result.length;
  }
}

