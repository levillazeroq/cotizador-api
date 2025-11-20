import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebpayController } from './webpay.controller';
import { WebpayService } from './webpay.service';
import { PaymentService } from '../payment.service';
import { PaymentRepository } from '../payment.repository';
import { PdfGeneratorService } from '../services/pdf-generator.service';
import { DatabaseModule } from '../../database/database.module';
import { S3Module } from '../../s3/s3.module';
import { OrganizationModule } from '../../organization/organization.module';

@Module({
  imports: [ConfigModule, DatabaseModule, S3Module, OrganizationModule],
  controllers: [WebpayController],
  providers: [
    WebpayService,
    PaymentService,
    PaymentRepository,
    PdfGeneratorService,
  ],
  exports: [WebpayService],
})
export class WebpayModule {}

