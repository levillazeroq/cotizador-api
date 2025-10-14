import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { CustomizationGroupRepository } from './customization-group.repository'
import { CreateCustomizationGroupDto } from './dto/create-customization-group.dto'
import { UpdateCustomizationGroupDto } from './dto/update-customization-group.dto'
import { ReorderCustomizationGroupsDto } from './dto/reorder-customization-groups.dto'
import { CustomizationGroup } from '../database/schemas'

@Injectable()
export class CustomizationGroupService {
  constructor(private readonly customizationGroupRepository: CustomizationGroupRepository) {}

  async findAll(): Promise<CustomizationGroup[]> {
    return await this.customizationGroupRepository.findAll()
  }

  async findActive(): Promise<CustomizationGroup[]> {
    return await this.customizationGroupRepository.findActive()
  }

  async findOne(id: string): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupRepository.findById(id)
    if (!customizationGroup) {
      throw new NotFoundException(`Customization group with ID ${id} not found`)
    }
    return customizationGroup
  }

  async create(createCustomizationGroupDto: CreateCustomizationGroupDto): Promise<CustomizationGroup> {
    // Check if customization group with same name already exists
    const existingGroup = await this.customizationGroupRepository.findByName(createCustomizationGroupDto.name)
    if (existingGroup) {
      throw new ConflictException(`Customization group with name '${createCustomizationGroupDto.name}' already exists`)
    }

    return await this.customizationGroupRepository.create({
      name: createCustomizationGroupDto.name,
      displayName: createCustomizationGroupDto.displayName,
      description: createCustomizationGroupDto.description,
      isActive: createCustomizationGroupDto.isActive ?? true,
      sortOrder: createCustomizationGroupDto.sortOrder ?? 0,
    })
  }

  async update(id: string, updateCustomizationGroupDto: UpdateCustomizationGroupDto): Promise<CustomizationGroup> {
    const existingGroup = await this.customizationGroupRepository.findById(id)
    if (!existingGroup) {
      throw new NotFoundException(`Customization group with ID ${id} not found`)
    }

    // Check if name is being changed and if new name already exists
    if (updateCustomizationGroupDto.name && updateCustomizationGroupDto.name !== existingGroup.name) {
      const groupWithSameName = await this.customizationGroupRepository.findByName(updateCustomizationGroupDto.name)
      if (groupWithSameName) {
        throw new ConflictException(`Customization group with name '${updateCustomizationGroupDto.name}' already exists`)
      }
    }

    const updatedGroup = await this.customizationGroupRepository.update(id, updateCustomizationGroupDto)
    if (!updatedGroup) {
      throw new NotFoundException(`Customization group with ID ${id} not found`)
    }

    return updatedGroup
  }

  async remove(id: string): Promise<void> {
    const existingGroup = await this.customizationGroupRepository.findById(id)
    if (!existingGroup) {
      throw new NotFoundException(`Customization group with ID ${id} not found`)
    }

    const deleted = await this.customizationGroupRepository.delete(id)
    if (!deleted) {
      throw new NotFoundException(`Customization group with ID ${id} not found`)
    }
  }

  async toggleActive(id: string): Promise<CustomizationGroup> {
    const group = await this.customizationGroupRepository.toggleActive(id)
    if (!group) {
      throw new NotFoundException(`Customization group with ID ${id} not found`)
    }
    return group
  }

  async reorder(reorderCustomizationGroupsDto: ReorderCustomizationGroupsDto): Promise<void> {
    await this.customizationGroupRepository.reorderGroups(reorderCustomizationGroupsDto.groupOrders)
  }
}
