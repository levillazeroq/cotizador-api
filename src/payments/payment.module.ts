import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { DatabaseModule } from '../database/database.module';
import { S3Module } from '../s3/s3.module';
import { ConversationsService } from 'src/conversations/conversations.service';

@Module({
  imports: [DatabaseModule, S3Module],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, ConversationsService],
  exports: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
