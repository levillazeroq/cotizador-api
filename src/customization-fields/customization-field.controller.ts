import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomizationFieldService } from './customization-field.service';
import { CreateCustomizationFieldDto } from './dto/create-customization-field.dto';
import { UpdateCustomizationFieldDto } from './dto/update-customization-field.dto';
import { ReorderCustomizationFieldsDto } from './dto/reorder-customization-fields.dto';
import { 
  CustomizationFieldResponseDto, 
  CustomizationFieldsListResponseDto,
  ToggleActiveResponseDto 
} from './dto/customization-field-response.dto';

@ApiTags('customization-fields')
@Controller('customization-fields')
export class CustomizationFieldController {
  constructor(private readonly customizationFieldService: CustomizationFieldService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nuevo campo de personalización',
    description: 'Crea un nuevo campo de personalización genérico. Soporta múltiples tipos: texto, número, select, imagen, etc.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Campo creado exitosamente',
    type: CustomizationFieldResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o error de validación' })
  create(@Body() createCustomizationFieldDto: CreateCustomizationFieldDto) {
    return this.customizationFieldService.create(createCustomizationFieldDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los campos de personalización',
    description: 'Retorna lista completa de campos disponibles'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista obtenida exitosamente',
    type: [CustomizationFieldResponseDto]
  })
  findAll() {
    return this.customizationFieldService.findAll();
  }

  @Get('grouped/all')
  @ApiOperation({ 
    summary: 'Obtener campos agrupados',
    description: 'Retorna campos organizados por grupos activos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Campos agrupados obtenidos exitosamente'
  })
  findAllGrouped() {
    return this.customizationFieldService.findAllGrouped();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener campo por ID' })
  @ApiParam({ name: 'id', description: 'ID del campo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Campo obtenido exitosamente',
    type: CustomizationFieldResponseDto
  })
  @ApiResponse({ status: 404, description: 'Campo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.customizationFieldService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar campo' })
  @ApiParam({ name: 'id', description: 'ID del campo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Campo actualizado exitosamente',
    type: CustomizationFieldResponseDto
  })
  @ApiResponse({ status: 404, description: 'Campo no encontrado' })
  update(@Param('id') id: string, @Body() updateCustomizationFieldDto: UpdateCustomizationFieldDto) {
    return this.customizationFieldService.update(id, updateCustomizationFieldDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar campo' })
  @ApiParam({ name: 'id', description: 'ID del campo' })
  @ApiResponse({ status: 204, description: 'Campo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Campo no encontrado' })
  remove(@Param('id') id: string) {
    return this.customizationFieldService.delete(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ 
    summary: 'Activar/Desactivar campo',
    description: 'Alterna el estado activo/inactivo sin eliminarlo'
  })
  @ApiParam({ name: 'id', description: 'ID del campo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado actualizado exitosamente',
    type: ToggleActiveResponseDto
  })
  @ApiResponse({ status: 404, description: 'Campo no encontrado' })
  toggleActive(@Param('id') id: string) {
    return this.customizationFieldService.toggleActive(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reordenar campos' })
  @ApiResponse({ status: 204, description: 'Campos reordenados exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en los datos de reordenamiento' })
  reorder(@Body() reorderCustomizationFieldsDto: ReorderCustomizationFieldsDto) {
    return this.customizationFieldService.reorder(reorderCustomizationFieldsDto);
  }
}
