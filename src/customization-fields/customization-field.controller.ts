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

@ApiTags('customization-fields')
@Controller('customization-fields')
export class CustomizationFieldController {
  constructor(private readonly customizationFieldService: CustomizationFieldService) {}

  @ApiOperation({
    summary: 'Crear nuevo campo de personalización',
    description: 'Crea un nuevo campo de personalización asociado a un grupo. Los campos pueden ser de tipo texto, número, fecha, selección, etc.',
  })
  @ApiBody({
    type: CreateCustomizationFieldDto,
    description: 'Datos del campo de personalización a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Campo de personalización creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'field_123456' },
        groupId: { type: 'string', example: 'group_789' },
        name: { type: 'string', example: 'Color del logo' },
        label: { type: 'string', example: 'Selecciona el color' },
        type: { type: 'string', example: 'select', enum: ['text', 'number', 'select', 'textarea', 'checkbox', 'radio'] },
        required: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        displayOrder: { type: 'number', example: 1 },
        options: { type: 'array', items: { type: 'string' }, example: ['Rojo', 'Azul', 'Verde'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o error de validación',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomizationFieldDto: CreateCustomizationFieldDto) {
    return this.customizationFieldService.create(createCustomizationFieldDto);
  }

  @ApiOperation({
    summary: 'Obtener todos los campos de personalización',
    description: 'Retorna una lista de todos los campos de personalización. Opcionalmente puede filtrarse por grupo usando el parámetro groupId.',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    type: String,
    description: 'ID del grupo para filtrar campos',
    example: 'group_789',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de campos obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'field_123456' },
          groupId: { type: 'string', example: 'group_789' },
          name: { type: 'string', example: 'Color del logo' },
          label: { type: 'string', example: 'Selecciona el color' },
          type: { type: 'string', example: 'select' },
          required: { type: 'boolean', example: true },
          isActive: { type: 'boolean', example: true },
          displayOrder: { type: 'number', example: 1 },
        },
      },
    },
  })
  @Get()
  findAll(@Query('groupId') groupId?: string) {
    if (groupId) {
      return this.customizationFieldService.findByGroupId(groupId);
    }
    return this.customizationFieldService.findAll();
  }

  @ApiOperation({
    summary: 'Obtener campo de personalización por ID',
    description: 'Retorna un campo de personalización específico con todos sus detalles',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del campo de personalización',
    example: 'field_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Campo obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'field_123456' },
        groupId: { type: 'string', example: 'group_789' },
        name: { type: 'string', example: 'Color del logo' },
        label: { type: 'string', example: 'Selecciona el color' },
        type: { type: 'string', example: 'select' },
        required: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        displayOrder: { type: 'number', example: 1 },
        options: { type: 'array', items: { type: 'string' } },
        placeholder: { type: 'string', example: 'Ingrese un valor' },
        helpText: { type: 'string', example: 'Texto de ayuda' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Campo no encontrado',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customizationFieldService.findById(id);
  }

  @ApiOperation({
    summary: 'Actualizar campo de personalización',
    description: 'Actualiza parcialmente un campo de personalización existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del campo de personalización a actualizar',
    example: 'field_123456',
    type: String,
  })
  @ApiBody({
    type: UpdateCustomizationFieldDto,
    description: 'Datos a actualizar del campo',
  })
  @ApiResponse({
    status: 200,
    description: 'Campo actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Campo no encontrado',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomizationFieldDto: UpdateCustomizationFieldDto) {
    return this.customizationFieldService.update(id, updateCustomizationFieldDto);
  }

  @ApiOperation({
    summary: 'Eliminar campo de personalización',
    description: 'Elimina permanentemente un campo de personalización del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del campo de personalización a eliminar',
    example: 'field_123456',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Campo eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Campo no encontrado',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.customizationFieldService.delete(id);
  }

  @ApiOperation({
    summary: 'Activar/Desactivar campo de personalización',
    description: 'Alterna el estado activo/inactivo de un campo de personalización sin eliminarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del campo de personalización',
    example: 'field_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del campo actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'field_123456' },
        isActive: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Campo no encontrado',
  })
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.customizationFieldService.toggleActive(id);
  }

  @ApiOperation({
    summary: 'Reordenar campos de personalización',
    description: 'Actualiza el orden de visualización de múltiples campos de personalización',
  })
  @ApiBody({
    type: ReorderCustomizationFieldsDto,
    description: 'Array con los IDs de los campos en el nuevo orden deseado',
  })
  @ApiResponse({
    status: 204,
    description: 'Campos reordenados exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de reordenamiento',
  })
  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Body() reorderCustomizationFieldsDto: ReorderCustomizationFieldsDto) {
    return this.customizationFieldService.reorder(reorderCustomizationFieldsDto);
  }
}
