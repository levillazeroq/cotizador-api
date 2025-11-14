import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';
import { OrganizationPaymentMethodService } from './organization-payment-method.service';
import { OrganizationPaymentMethodController } from './organization-payment-method.controller';
import { OrganizationPaymentMethodRepository } from './organization-payment-method.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController, OrganizationPaymentMethodController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    OrganizationPaymentMethodService,
    OrganizationPaymentMethodRepository,
  ],
  exports: [
    OrganizationService,
    OrganizationRepository,
    OrganizationPaymentMethodService,
    OrganizationPaymentMethodRepository,
  ],
})
export class OrganizationModule {}
