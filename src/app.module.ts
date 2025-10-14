import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentMethodModule } from './payment-methods/payment-method.module';

@Module({
  imports: [PaymentMethodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
