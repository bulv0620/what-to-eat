import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { RandomItemDto } from './dto/random-item.dto';
import { GetOrderDto } from './dto/get-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('randomItem')
  getRandomItem(@Body() randomItemDto: RandomItemDto) {
    return this.orderService.getRandomItem(randomItemDto);
  }

  @Post('getOne')
  getOrderByDate(@Body() getOrderDto: GetOrderDto) {
    return this.orderService.getOrder(getOrderDto);
  }

  @Post('update')
  updateOrder(@Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.updateOrder(updateOrderDto);
  }
}
