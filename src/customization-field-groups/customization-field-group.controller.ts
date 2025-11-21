import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CustomizationFieldGroupService } from './customization-field-group.service';
import { CreateCustomizationFieldGroupDto } from './dto/create-customization-field-group.dto';
import { UpdateCustomizationFieldGroupDto } from './dto/update-customization-field-group.dto';

@Controller('customization-field-groups')
export class CustomizationFieldGroupController {
  constructor(private readonly customizationFieldGroupService: CustomizationFieldGroupService) {}

  @Post()
  create(@Body() createDto: CreateCustomizationFieldGroupDto) {
    return this.customizationFieldGroupService.create(createDto);
  }

  @Get()
  findAll() {
    return this.customizationFieldGroupService.findAll();
  }

  @Get('active')
  findAllActive() {
    return this.customizationFieldGroupService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customizationFieldGroupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCustomizationFieldGroupDto) {
    return this.customizationFieldGroupService.update(id, updateDto);
  }

  @Put(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.customizationFieldGroupService.toggleActive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customizationFieldGroupService.remove(id);
  }
}

