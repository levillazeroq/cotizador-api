import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { customizationFieldGroups, type CustomizationFieldGroup, type NewCustomizationFieldGroup } from '../database/schemas';
import { CreateCustomizationFieldGroupDto } from './dto/create-customization-field-group.dto';
import { UpdateCustomizationFieldGroupDto } from './dto/update-customization-field-group.dto';

@Injectable()
export class CustomizationFieldGroupService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDto: CreateCustomizationFieldGroupDto): Promise<CustomizationFieldGroup> {
    const result = await this.databaseService.db
      .insert(customizationFieldGroups)
      .values({
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  }

  async findAll(): Promise<CustomizationFieldGroup[]> {
    return await this.databaseService.db
      .select()
      .from(customizationFieldGroups)
      .orderBy(asc(customizationFieldGroups.sortOrder), asc(customizationFieldGroups.createdAt));
  }

  async findAllActive(): Promise<CustomizationFieldGroup[]> {
    return await this.databaseService.db
      .select()
      .from(customizationFieldGroups)
      .where(eq(customizationFieldGroups.isActive, true))
      .orderBy(asc(customizationFieldGroups.sortOrder));
  }

  async findOne(id: string): Promise<CustomizationFieldGroup> {
    const result = await this.databaseService.db
      .select()
      .from(customizationFieldGroups)
      .where(eq(customizationFieldGroups.id, id))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException(`Customization field group with ID ${id} not found`);
    }

    return result[0];
  }

  async update(id: string, updateDto: UpdateCustomizationFieldGroupDto): Promise<CustomizationFieldGroup> {
    await this.findOne(id); // Verifica que existe

    const result = await this.databaseService.db
      .update(customizationFieldGroups)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      })
      .where(eq(customizationFieldGroups.id, id))
      .returning();

    return result[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verifica que existe

    await this.databaseService.db
      .delete(customizationFieldGroups)
      .where(eq(customizationFieldGroups.id, id));
  }

  async toggleActive(id: string): Promise<CustomizationFieldGroup> {
    const group = await this.findOne(id);

    const result = await this.databaseService.db
      .update(customizationFieldGroups)
      .set({
        isActive: !group.isActive,
        updatedAt: new Date(),
      })
      .where(eq(customizationFieldGroups.id, id))
      .returning();

    return result[0];
  }
}

