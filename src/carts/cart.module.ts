import { Module } from '@nestjs/common'
import { CartService } from './cart.service'
import { CartController, CartItemController } from './cart.controller'
import { CartRepository } from './cart.repository'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [CartController, CartItemController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
