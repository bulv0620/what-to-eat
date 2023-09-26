import { BadRequestException, Injectable } from '@nestjs/common';

import { Item } from 'src/item/entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { RandomItemDto } from './dto/random-item.dto';
import { GetOrderDto } from './dto/get-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async updateOrder(updateOrderDto: UpdateOrderDto) {
    let order = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.group', 'group')
      .leftJoinAndSelect('order.items', 'items')
      .where('group.id = :groupId', { groupId: updateOrderDto.group.id })
      .andWhere(`order.createTime BETWEEN :startDate AND :endDate`, {
        startDate: updateOrderDto.date[0],
        endDate: updateOrderDto.date[1],
      })
      .getOne();

    if (!order) {
      order = new Order();
      order.group = updateOrderDto.group;
      order.items = [];
    }
    if (updateOrderDto.removeItems) {
      order.items = order.items.filter((existItem) =>
        updateOrderDto.removeItems.every((item) => item.id !== existItem.id),
      );
    }

    if (updateOrderDto.items) {
      order.items.push(...updateOrderDto.items);
    }

    await this.orderRepository.save(order);

    return order;
  }

  async getOrder(getOrderDto: GetOrderDto) {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.group', 'group')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.votes', 'votes')
      .leftJoinAndSelect('votes.user', 'user') // 关联votes表的user信息
      .where('group.id = :groupId', { groupId: getOrderDto.group.id })
      .andWhere(`order.createTime BETWEEN :startDate AND :endDate`, {
        startDate: getOrderDto.date[0],
        endDate: getOrderDto.date[1],
      })
      .getOne();

    return order;
  }

  async getRandomItem(randomItemDto: RandomItemDto) {
    const curOrder = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.group', 'group')
      .leftJoinAndSelect('order.items', 'items')
      .where('group.id = :groupId', { groupId: randomItemDto.group.id })
      .andWhere(`order.createTime BETWEEN :startDate AND :endDate`, {
        startDate: randomItemDto.date[0],
        endDate: randomItemDto.date[1],
      })
      .getOne();

    let excludedItemIds: number[] = [];
    if (curOrder) {
      excludedItemIds = curOrder.items.map((el) => el.id);
    }

    const items = await this.itemRepository
      .createQueryBuilder('item')
      .where('item.group = :groupId', { groupId: randomItemDto.group.id })
      .andWhere('item.type = :type', { type: randomItemDto.type })
      .getMany();

    const availableItems = items.filter(
      (item) => !excludedItemIds.includes(item.id),
    );

    if (!availableItems.length) {
      throw new BadRequestException('库存选项不够了');
    }

    const ramdomItem = this.getRandomValueFromArray(availableItems);

    return ramdomItem;
  }

  getRandomValueFromArray(array: any[]) {
    const randomIndex = Math.floor(Math.random() * array.length);

    const randomValue = array[randomIndex];

    return randomValue;
  }
}
