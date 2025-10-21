import { Module } from '@nestjs/common'
import { CartService } from './cart.service'
import { CartController } from './cart.controller'
import { CartRepository } from './cart.repository'
import { CartGateway } from './cart.gateway'
import { DatabaseModule } from '../database/database.module'
import { ProductsModule } from '../products/products.module'

@Module({
  imports: [DatabaseModule, ProductsModule],
  controllers: [CartController],
  providers: [CartService, CartRepository, CartGateway],
  exports: [CartService, CartGateway],
})
export class CartModule {}
