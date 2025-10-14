import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PaymentMethodModule } from './payment-methods/payment-method.module';
import { CustomizationGroupModule } from './customization-groups/customization-group.module';
import { CustomizationFieldModule } from './customization-fields/customization-field.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    PaymentMethodModule, 
    CustomizationGroupModule,
    CustomizationFieldModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
