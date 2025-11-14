import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PaymentMethodModule } from './payment-methods/payment-method.module';
import { CustomizationGroupModule } from './customization-groups/customization-group.module';
import { CustomizationFieldModule } from './customization-fields/customization-field.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './carts/cart.module';
import { InventoryModule } from './inventory/inventory.module';
import { S3Module } from './s3/s3.module';
import { PaymentModule } from './payments/payment.module';
import { ConversationsService } from './conversations/conversations.service';
// import { OrganizationModule } from './organization/organization.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,
    PaymentMethodModule, 
    CustomizationGroupModule,
    CustomizationFieldModule,
    ProductsModule,
    CartModule,
    InventoryModule,
    S3Module,
    PaymentModule,
    // OrganizationModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConversationsService],
})
export class AppModule {}
