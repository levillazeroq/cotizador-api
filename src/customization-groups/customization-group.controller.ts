import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { CustomizationGroupService } from './customization-group.service'
import { CreateCustomizationGroupDto } from './dto/create-customization-group.dto'
import { UpdateCustomizationGroupDto } from './dto/update-customization-group.dto'
import { ReorderCustomizationGroupsDto } from './dto/reorder-customization-groups.dto'
import { CustomizationGroup } from '../database/schemas'

@Controller('customization-groups')
export class CustomizationGroupController {
  constructor(private readonly customizationGroupService: CustomizationGroupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCustomizationGroupDto: CreateCustomizationGroupDto): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.create(createCustomizationGroupDto)
    return customizationGroup
  }

  @Get()
  async findAll(): Promise<CustomizationGroup[]> {
    const customizationGroups = await this.customizationGroupService.findAll()
    return customizationGroups
  }

  @Get('active')
  async findActive(): Promise<CustomizationGroup[]> {
    const customizationGroups = await this.customizationGroupService.findActive()
    return customizationGroups
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.findOne(id)
    return customizationGroup
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomizationGroupDto: UpdateCustomizationGroupDto,
  ): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.update(id, updateCustomizationGroupDto)
    return customizationGroup
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.customizationGroupService.remove(id)
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.toggleActive(id)
    return customizationGroup
  }

  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(@Body() reorderCustomizationGroupsDto: ReorderCustomizationGroupsDto): Promise<void> {
    await this.customizationGroupService.reorder(reorderCustomizationGroupsDto)
  }
}
