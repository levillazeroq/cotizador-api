import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { CartChangelogRepository } from './cart-changelog.repository';
import { CartGateway } from './cart.gateway';
import { PriceListEvaluationService } from './services/price-list-evaluation.service';
import { DatabaseModule } from '../database/database.module';
import { ProductsModule } from '../products/products.module';
import { PaymentModule } from '../payments/payment.module';
import { ConversationsService } from '../conversations/conversations.service';
import { PriceListsService } from '../price-lists/price-lists.service';

@Module({
  imports: [DatabaseModule, ProductsModule, PaymentModule],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepository,
    CartChangelogRepository,
    CartGateway,
    ConversationsService,
    PriceListEvaluationService,
    PriceListsService,
  ],
  exports: [CartService, CartGateway, PriceListEvaluationService],
})
export class CartModule {}
