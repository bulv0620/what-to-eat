import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from 'src/item/entities/item.entity';
import { Order } from './entities/order.entity';
import { Group } from 'src/group/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Order, Item])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
