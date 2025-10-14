import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CustomizationFieldService } from './customization-field.service';
import { CreateCustomizationFieldDto } from './dto/create-customization-field.dto';
import { UpdateCustomizationFieldDto } from './dto/update-customization-field.dto';
import { ReorderCustomizationFieldsDto } from './dto/reorder-customization-fields.dto';

@Controller('customization-fields')
export class CustomizationFieldController {
  constructor(private readonly customizationFieldService: CustomizationFieldService) {}

  @Post()
  create(@Body() createCustomizationFieldDto: CreateCustomizationFieldDto) {
    return this.customizationFieldService.create(createCustomizationFieldDto);
  }

  @Get()
  findAll(@Query('groupId') groupId?: string) {
    if (groupId) {
      return this.customizationFieldService.findByGroupId(groupId);
    }
    return this.customizationFieldService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customizationFieldService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomizationFieldDto: UpdateCustomizationFieldDto) {
    return this.customizationFieldService.update(id, updateCustomizationFieldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customizationFieldService.delete(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.customizationFieldService.toggleActive(id);
  }

  @Post('reorder')
  reorder(@Body() reorderCustomizationFieldsDto: ReorderCustomizationFieldsDto) {
    return this.customizationFieldService.reorder(reorderCustomizationFieldsDto);
  }
}
