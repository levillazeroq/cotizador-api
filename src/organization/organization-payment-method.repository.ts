import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import {
  organizationPaymentMethods,
  type OrganizationPaymentMethod,
  type NewOrganizationPaymentMethod,
} from '../database/schemas';

@Injectable()
export class OrganizationPaymentMethodRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(): Promise<OrganizationPaymentMethod[]> {
    return await this.databaseService.db
      .select()
      .from(organizationPaymentMethods);
  }

  async findById(id: number): Promise<OrganizationPaymentMethod | null> {
    const result = await this.databaseService.db
      .select()
      .from(organizationPaymentMethods)
      .where(eq(organizationPaymentMethods.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findByOrganizationId(
    organizationId: number,
  ): Promise<OrganizationPaymentMethod | null> {
    const result = await this.databaseService.db
      .select()
      .from(organizationPaymentMethods)
      .where(eq(organizationPaymentMethods.organizationId, organizationId))
      .limit(1);

    return result[0] || null;
  }

  async create(
    newPaymentMethod: NewOrganizationPaymentMethod,
  ): Promise<OrganizationPaymentMethod> {
    const result = await this.databaseService.db
      .insert(organizationPaymentMethods)
      .values(newPaymentMethod)
      .returning();

    return result[0];
  }

  async update(
    id: number,
    updateData: Partial<OrganizationPaymentMethod>,
  ): Promise<OrganizationPaymentMethod | null> {
    const result = await this.databaseService.db
      .update(organizationPaymentMethods)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(organizationPaymentMethods.id, id))
      .returning();

    return result[0] || null;
  }

  async updateByOrganizationId(
    organizationId: number,
    updateData: Partial<OrganizationPaymentMethod>,
  ): Promise<OrganizationPaymentMethod | null> {
    const result = await this.databaseService.db
      .update(organizationPaymentMethods)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(organizationPaymentMethods.organizationId, organizationId))
      .returning();

    return result[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(organizationPaymentMethods)
      .where(eq(organizationPaymentMethods.id, id))
      .returning();

    return result.length > 0;
  }

  async deleteByOrganizationId(organizationId: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(organizationPaymentMethods)
      .where(eq(organizationPaymentMethods.organizationId, organizationId))
      .returning();

    return result.length > 0;
  }
}

