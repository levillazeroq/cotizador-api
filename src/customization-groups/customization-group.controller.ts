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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { CustomizationGroupService } from './customization-group.service'
import { CreateCustomizationGroupDto } from './dto/create-customization-group.dto'
import { UpdateCustomizationGroupDto } from './dto/update-customization-group.dto'
import { ReorderCustomizationGroupsDto } from './dto/reorder-customization-groups.dto'
import { CustomizationGroup } from '../database/schemas'

@ApiTags('customization-groups')
@Controller('customization-groups')
export class CustomizationGroupController {
  constructor(private readonly customizationGroupService: CustomizationGroupService) {}

  @ApiOperation({
    summary: 'Crear nuevo grupo de personalización',
    description: 'Crea un nuevo grupo de personalización que puede contener múltiples campos. Los grupos ayudan a organizar las opciones de personalización de productos.',
  })
  @ApiBody({
    type: CreateCustomizationGroupDto,
    description: 'Datos del grupo de personalización a crear',
  })
  @ApiResponse({
    status: 201,
    description: 'Grupo de personalización creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'group_123456' },
        name: { type: 'string', example: 'Personalización de logos' },
        description: { type: 'string', example: 'Opciones para personalizar el logo del producto' },
        isActive: { type: 'boolean', example: true },
        displayOrder: { type: 'number', example: 1 },
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
  async create(@Body() createCustomizationGroupDto: CreateCustomizationGroupDto): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.create(createCustomizationGroupDto)
    return customizationGroup
  }

  @ApiOperation({
    summary: 'Obtener todos los grupos de personalización',
    description: 'Retorna una lista completa de todos los grupos de personalización registrados en el sistema, incluyendo activos e inactivos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'group_123456' },
          name: { type: 'string', example: 'Personalización de logos' },
          description: { type: 'string', example: 'Opciones para personalizar el logo del producto' },
          isActive: { type: 'boolean', example: true },
          displayOrder: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @Get()
  async findAll(): Promise<CustomizationGroup[]> {
    const customizationGroups = await this.customizationGroupService.findAll()
    return customizationGroups
  }

  @ApiOperation({
    summary: 'Obtener grupos de personalización activos',
    description: 'Retorna únicamente los grupos de personalización que están marcados como activos y disponibles para uso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos activos obtenida exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'group_123456' },
          name: { type: 'string', example: 'Personalización de logos' },
          description: { type: 'string', example: 'Opciones para personalizar el logo del producto' },
          isActive: { type: 'boolean', example: true },
          displayOrder: { type: 'number', example: 1 },
        },
      },
    },
  })
  @Get('active')
  async findActive(): Promise<CustomizationGroup[]> {
    const customizationGroups = await this.customizationGroupService.findActive()
    return customizationGroups
  }

  @ApiOperation({
    summary: 'Obtener grupo de personalización por ID',
    description: 'Retorna un grupo de personalización específico con todos sus detalles y campos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grupo de personalización',
    example: 'group_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'group_123456' },
        name: { type: 'string', example: 'Personalización de logos' },
        description: { type: 'string', example: 'Opciones para personalizar el logo del producto' },
        isActive: { type: 'boolean', example: true },
        displayOrder: { type: 'number', example: 1 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo no encontrado',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.findOne(id)
    return customizationGroup
  }

  @ApiOperation({
    summary: 'Actualizar grupo de personalización',
    description: 'Actualiza parcialmente un grupo de personalización existente. Solo los campos proporcionados serán actualizados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grupo de personalización a actualizar',
    example: 'group_123456',
    type: String,
  })
  @ApiBody({
    type: UpdateCustomizationGroupDto,
    description: 'Datos a actualizar del grupo',
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'group_123456' },
        name: { type: 'string', example: 'Personalización de logos actualizado' },
        description: { type: 'string', example: 'Nueva descripción' },
        isActive: { type: 'boolean', example: true },
        displayOrder: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo no encontrado',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomizationGroupDto: UpdateCustomizationGroupDto,
  ): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.update(id, updateCustomizationGroupDto)
    return customizationGroup
  }

  @ApiOperation({
    summary: 'Eliminar grupo de personalización',
    description: 'Elimina permanentemente un grupo de personalización del sistema. ADVERTENCIA: esto también puede afectar a los campos asociados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grupo de personalización a eliminar',
    example: 'group_123456',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Grupo eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo no encontrado',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.customizationGroupService.remove(id)
  }

  @ApiOperation({
    summary: 'Activar/Desactivar grupo de personalización',
    description: 'Alterna el estado activo/inactivo de un grupo de personalización. Los grupos inactivos no se muestran en la interfaz de usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del grupo de personalización',
    example: 'group_123456',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del grupo actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'group_123456' },
        name: { type: 'string', example: 'Personalización de logos' },
        isActive: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo no encontrado',
  })
  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string): Promise<CustomizationGroup> {
    const customizationGroup = await this.customizationGroupService.toggleActive(id)
    return customizationGroup
  }

  @ApiOperation({
    summary: 'Reordenar grupos de personalización',
    description: 'Actualiza el orden de visualización de múltiples grupos de personalización. El orden determina cómo se muestran en la interfaz.',
  })
  @ApiBody({
    type: ReorderCustomizationGroupsDto,
    description: 'Array con los IDs de los grupos en el nuevo orden deseado',
    schema: {
      type: 'object',
      properties: {
        order: {
          type: 'array',
          items: { type: 'string' },
          example: ['group_456', 'group_123', 'group_789'],
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Grupos reordenados exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos de reordenamiento',
  })
  @Post('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(@Body() reorderCustomizationGroupsDto: ReorderCustomizationGroupsDto): Promise<void> {
    await this.customizationGroupService.reorder(reorderCustomizationGroupsDto)
  }
}
