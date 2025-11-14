import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import {
  UpdateOrganizationDto,
  UpdateOrganizationStatusDto,
} from './dto/update-organization.dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
  })
  @ApiResponse({ status: 409, description: 'Organization code already exists' })
  @ApiBody({ type: CreateOrganizationDto })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({
    status: 200,
    description: 'Returns all organizations',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted organizations',
  })
  findAll(@Query('includeDeleted') includeDeleted?: string) {
    const includeDeletedBool = includeDeleted === 'true';
    return this.organizationService.findAll(includeDeletedBool);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search organizations' })
  @ApiResponse({
    status: 200,
    description: 'Returns matching organizations',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search term',
  })
  search(@Query('q') searchTerm: string) {
    return this.organizationService.search(searchTerm);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get organizations by status' })
  @ApiResponse({
    status: 200,
    description: 'Returns organizations with the specified status',
  })
  @ApiParam({
    name: 'status',
    enum: ['active', 'inactive', 'suspended'],
  })
  findByStatus(@Param('status') status: string) {
    return this.organizationService.findByStatus(status);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get organization by code' })
  @ApiResponse({
    status: 200,
    description: 'Returns organization with the specified code',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'code', type: String })
  findByCode(@Param('code') code: string) {
    return this.organizationService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the organization',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'Organization code already exists' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrganizationDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update organization status' })
  @ApiResponse({
    status: 200,
    description: 'Organization status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrganizationStatusDto })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateOrganizationStatusDto,
  ) {
    return this.organizationService.updateStatus(id, statusDto.status);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update organization settings' })
  @ApiResponse({
    status: 200,
    description: 'Organization settings updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'id', type: Number })
  updateSettings(
    @Param('id', ParseIntPipe) id: number,
    @Body() settings: Record<string, any>,
  ) {
    return this.organizationService.updateSettings(id, settings);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization soft deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.remove(id);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization permanently deleted',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiParam({ name: 'id', type: Number })
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.hardDelete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft-deleted organization' })
  @ApiResponse({
    status: 200,
    description: 'Organization restored successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 400, description: 'Organization is not deleted' })
  @ApiParam({ name: 'id', type: Number })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.organizationService.restore(id);
  }
}
