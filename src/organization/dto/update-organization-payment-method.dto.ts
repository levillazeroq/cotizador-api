import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrganizationPaymentMethodDto } from './create-organization-payment-method.dto';

export class UpdateOrganizationPaymentMethodDto extends PartialType(
  OmitType(CreateOrganizationPaymentMethodDto, ['organizationId'] as const)
) {}

