import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { WebpayService } from './webpay.service';
import { DatabaseModule } from '../database/database.module';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [DatabaseModule, S3Module],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, WebpayService],
  exports: [PaymentService, PaymentRepository, WebpayService],
})
export class PaymentModule {}
