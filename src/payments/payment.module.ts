import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { DatabaseModule } from '../database/database.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [DatabaseModule, S3Module],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, PdfGeneratorService],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
