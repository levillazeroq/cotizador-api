import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, isNull, or, ilike } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import {
  organizations,
  type Organization,
  type NewOrganization,
} from '../database/schemas';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(includeDeleted = false): Promise<Organization[]> {
    const query = this.databaseService.db
      .select()
      .from(organizations)
      .orderBy(desc(organizations.updatedAt));

    if (!includeDeleted) {
      query.where(isNull(organizations.deletedAt));
    }

    return await query;
  }

  async findById(id: number): Promise<Organization | null> {
    const result = await this.databaseService.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findByCode(code: string): Promise<Organization | null> {
    const result = await this.databaseService.db
      .select()
      .from(organizations)
      .where(eq(organizations.code, code))
      .limit(1);

    return result[0] || null;
  }

  async findByStatus(status: string): Promise<Organization[]> {
    return await this.databaseService.db
      .select()
      .from(organizations)
      .where(eq(organizations.status, status))
      .orderBy(desc(organizations.updatedAt));
  }

  async search(searchTerm: string): Promise<Organization[]> {
    return await this.databaseService.db
      .select()
      .from(organizations)
      .where(
        or(
          ilike(organizations.name, `%${searchTerm}%`),
          ilike(organizations.code, `%${searchTerm}%`),
          ilike(organizations.description, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(organizations.updatedAt));
  }

  async create(newOrganization: NewOrganization): Promise<Organization> {
    const result = await this.databaseService.db
      .insert(organizations)
      .values(newOrganization)
      .returning();

    return result[0];
  }

  async update(
    id: number,
    updateData: Partial<Organization>,
  ): Promise<Organization | null> {
    const result = await this.databaseService.db
      .update(organizations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    return result[0] || null;
  }

  async softDelete(id: number): Promise<Organization | null> {
    const result = await this.databaseService.db
      .update(organizations)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    return result[0] || null;
  }

  async hardDelete(id: number): Promise<boolean> {
    const result = await this.databaseService.db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    return result.length > 0;
  }

  async restore(id: number): Promise<Organization | null> {
    const result = await this.databaseService.db
      .update(organizations)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    return result[0] || null;
  }

  async updateStatus(
    id: number,
    status: 'active' | 'inactive' | 'suspended',
  ): Promise<Organization | null> {
    return await this.update(id, { status });
  }

  async updateSettings(
    id: number,
    settings: Record<string, any>,
  ): Promise<Organization | null> {
    return await this.update(id, { settings });
  }
}

