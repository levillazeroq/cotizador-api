import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrganizationPaymentMethodService } from './organization-payment-method.service';
import { CreateOrganizationPaymentMethodDto } from './dto/create-organization-payment-method.dto';
import { UpdateOrganizationPaymentMethodDto } from './dto/update-organization-payment-method.dto';

@ApiTags('organization-payment-methods')
@Controller('organization-payment-methods')
export class OrganizationPaymentMethodController {
  constructor(
    private readonly paymentMethodService: OrganizationPaymentMethodService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create organization payment methods configuration' })
  @ApiResponse({
    status: 201,
    description: 'Payment methods configuration created successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({
    status: 409,
    description: 'Payment methods already exist for this organization',
  })
  @ApiBody({ type: CreateOrganizationPaymentMethodDto })
  create(@Body() createDto: CreateOrganizationPaymentMethodDto) {
    return this.paymentMethodService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organization payment methods configurations' })
  @ApiResponse({
    status: 200,
    description: 'Returns all payment methods configurations',
  })
  findAll() {
    return this.paymentMethodService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment methods configuration by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the payment methods configuration',
  })
  @ApiResponse({ status: 404, description: 'Payment methods configuration not found' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodService.findOne(id);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get payment methods configuration by organization ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the payment methods configuration for the organization',
  })
  @ApiResponse({ status: 404, description: 'Payment methods configuration not found' })
  @ApiParam({ name: 'organizationId', type: Number })
  findByOrganizationId(
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ) {
    return this.paymentMethodService.findByOrganizationId(organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment methods configuration' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods configuration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment methods configuration not found' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrganizationPaymentMethodDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrganizationPaymentMethodDto,
  ) {
    return this.paymentMethodService.update(id, updateDto);
  }

  @Patch('organization/:organizationId')
  @ApiOperation({
    summary: 'Update payment methods configuration by organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods configuration updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Organization or payment methods not found' })
  @ApiParam({ name: 'organizationId', type: Number })
  @ApiBody({ type: UpdateOrganizationPaymentMethodDto })
  updateByOrganizationId(
    @Param('organizationId', ParseIntPipe) organizationId: number,
    @Body() updateDto: UpdateOrganizationPaymentMethodDto,
  ) {
    return this.paymentMethodService.updateByOrganizationId(
      organizationId,
      updateDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete payment methods configuration' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods configuration deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment methods configuration not found' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentMethodService.remove(id);
  }

  @Delete('organization/:organizationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete payment methods configuration by organization ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment methods configuration deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment methods configuration not found' })
  @ApiParam({ name: 'organizationId', type: Number })
  removeByOrganizationId(
    @Param('organizationId', ParseIntPipe) organizationId: number,
  ) {
    return this.paymentMethodService.removeByOrganizationId(organizationId);
  }
}

