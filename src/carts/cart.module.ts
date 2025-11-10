import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { CartChangelogRepository } from './cart-changelog.repository';
import { CartGateway } from './cart.gateway';
import { PriceValidationService } from './services/price-validation.service';
import { DatabaseModule } from '../database/database.module';
import { ProductsModule } from '../products/products.module';
import { PaymentModule } from '../payments/payment.module';
import { ConversationsService } from '../conversations/conversations.service';

@Module({
  imports: [DatabaseModule, ProductsModule, PaymentModule],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    CartChangelogRepository,
    CartGateway,
    ConversationsService,
    PriceValidationService,
  ],
  exports: [CartService, CartGateway, PriceValidationService],
})
export class CartModule {}
