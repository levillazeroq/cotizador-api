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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    PaymentMethodModule, 
    CustomizationGroupModule,
    CustomizationFieldModule,
    ProductsModule,
    CartModule,
    InventoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
