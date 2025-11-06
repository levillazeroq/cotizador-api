import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomizationFieldRepository } from './customization-field.repository';
import { CreateCustomizationFieldDto } from './dto/create-customization-field.dto';
import { UpdateCustomizationFieldDto } from './dto/update-customization-field.dto';
import { ReorderCustomizationFieldsDto } from './dto/reorder-customization-fields.dto';

@Injectable()
export class CustomizationFieldService {
  constructor(
    private readonly customizationFieldRepository: CustomizationFieldRepository,
  ) {}

  async findAll(): Promise<any[]> {
    return await this.customizationFieldRepository.findAll();
  }

  async findById(id: string): Promise<any> {
    const field = await this.customizationFieldRepository.findById(id);
    if (!field) {
      throw new NotFoundException(`Customization field with ID ${id} not found`);
    }
    return field;
  }

  async create(createCustomizationFieldDto: CreateCustomizationFieldDto): Promise<any> {
    return await this.customizationFieldRepository.create(createCustomizationFieldDto);
  }

  async update(id: string, updateCustomizationFieldDto: UpdateCustomizationFieldDto): Promise<any> {
    const field = await this.customizationFieldRepository.findById(id);
    if (!field) {
      throw new NotFoundException(`Customization field with ID ${id} not found`);
    }

    return await this.customizationFieldRepository.update(id, updateCustomizationFieldDto);
  }

  async delete(id: string): Promise<void> {
    const field = await this.customizationFieldRepository.findById(id);
    if (!field) {
      throw new NotFoundException(`Customization field with ID ${id} not found`);
    }

    await this.customizationFieldRepository.delete(id);
  }

  async toggleActive(id: string): Promise<any> {
    return await this.customizationFieldRepository.toggleActive(id);
  }

  async reorder(reorderCustomizationFieldsDto: ReorderCustomizationFieldsDto): Promise<void> {
    await this.customizationFieldRepository.reorder(reorderCustomizationFieldsDto.fieldOrders);
  }
}
