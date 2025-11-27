import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  priceLists,
  priceListConditions,
  type PriceList,
  type NewPriceList,
  type PriceListCondition,
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

export interface PriceListWithConditions extends PriceList {
  conditions: PriceListCondition[];
}

@Injectable()
export class PriceListRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(
    organizationId: number,
    options?: { status?: string },
  ): Promise<PriceList[]> {
    const conditions = [eq(priceLists.organizationId, organizationId)];

    if (options?.status) {
      conditions.push(eq(priceLists.status, options.status));
    }

    return await this.databaseService.db
      .select()
      .from(priceLists)
      .where(and(...conditions))
      .orderBy(desc(priceLists.isDefault), desc(priceLists.createdAt));
  }

  async findAllWithConditions(
    organizationId: number,
    options?: { status?: string },
  ): Promise<PriceListWithConditions[]> {
    const priceListsData = await this.findAll(organizationId, options);

    // Obtener todas las condiciones de estas listas de precios en una sola query
    const priceListIds = priceListsData.map((pl) => pl.id);

    if (priceListIds.length === 0) {
      return [];
    }

    const rawConditions = await this.databaseService.db
      .select()
      .from(priceListConditions)
      .where(
        and(
          inArray(priceListConditions.priceListId, priceListIds),
          eq(priceListConditions.status, 'active'),
        ),
      )
      .orderBy(priceListConditions.createdAt);

    // Sanitizar y agrupar condiciones por priceListId
    const conditions = rawConditions.map(sanitizeCondition);
    const conditionsByPriceList = conditions.reduce(
      (acc, condition) => {
        if (!acc[condition.priceListId]) {
          acc[condition.priceListId] = [];
        }
        acc[condition.priceListId].push(condition);
        return acc;
      },
      {} as Record<number, PriceListCondition[]>,
    );

    // Combinar price lists con sus condiciones
    return priceListsData.map((priceList) => ({
      ...priceList,
      conditions: conditionsByPriceList[priceList.id] || [],
    }));
  }

  async findById(id: number, organizationId: number): Promise<PriceList | null> {
    const result = await this.databaseService.db
      .select()
      .from(priceLists)
      .where(
        and(
          eq(priceLists.id, id),
          eq(priceLists.organizationId, organizationId),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async findByIdWithConditions(
    id: number,
    organizationId: number,
  ): Promise<PriceListWithConditions | null> {
    const priceList = await this.findById(id, organizationId);

    if (!priceList) {
      return null;
    }

    const rawConditions = await this.databaseService.db
      .select()
      .from(priceListConditions)
      .where(
        and(
          eq(priceListConditions.priceListId, id),
          eq(priceListConditions.status, 'active'),
        ),
      )
      .orderBy(priceListConditions.createdAt);

    return {
      ...priceList,
      conditions: rawConditions.map(sanitizeCondition),
    };
  }

  async findDefault(organizationId: number): Promise<PriceList | null> {
    const result = await this.databaseService.db
      .select()
      .from(priceLists)
      .where(
        and(
          eq(priceLists.organizationId, organizationId),
          eq(priceLists.isDefault, true),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  async create(data: NewPriceList): Promise<PriceList> {
    const result = await this.databaseService.db
      .insert(priceLists)
      .values(data)
      .returning();

    return result[0];
  }

  async update(
    id: number,
    organizationId: number,
    data: Partial<NewPriceList>,
  ): Promise<PriceList> {
    const result = await this.databaseService.db
      .update(priceLists)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(priceLists.id, id),
          eq(priceLists.organizationId, organizationId),
        ),
      )
      .returning();

    if (!result[0]) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }

    return result[0];
  }

  async delete(id: number, organizationId: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(priceLists)
      .where(
        and(
          eq(priceLists.id, id),
          eq(priceLists.organizationId, organizationId),
        ),
      )
      .returning();

    return result.length > 0;
  }
}

