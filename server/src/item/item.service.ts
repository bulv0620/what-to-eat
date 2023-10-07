import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetItemDto } from './dto/get-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto) {
    const existItem = await this.itemRepository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.group', 'group')
      .where('group.id = :groupId', { groupId: createItemDto.group.id })
      .andWhere('item.itemName = :itemName', {
        itemName: createItemDto.itemName,
      })
      .getOne();
    if (existItem) {
      throw new BadRequestException('菜品已存在');
    }
    const item = new Item();
    item.itemName = createItemDto.itemName;
    item.type = createItemDto.type;
    item.group = createItemDto.group;

    return await this.itemRepository.save(item);
  }

  async findAll(group: GetItemDto) {
    const items = await this.itemRepository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.group', 'group')
      .where('group.id = :groupId', { groupId: group.id })
      .getMany();

    return items;
  }

  async update(updateItemDto: UpdateItemDto) {
    const item = await this.itemRepository.findOne({
      where: { id: updateItemDto.id },
    });

    if (!item) {
      throw new BadRequestException('菜品不存在');
    }

    const existItem = await this.itemRepository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.group', 'group')
      .where('group.id = :groupId', { groupId: updateItemDto.group.id })
      .andWhere('item.itemName = :itemName', {
        itemName: updateItemDto.itemName,
      })
      .andWhere('item.id != :itemId', { itemId: updateItemDto.id })
      .getOne();
    if (existItem) {
      throw new BadRequestException('菜品已存在');
    }

    item.itemName = updateItemDto.itemName;

    return await this.itemRepository.save(item);
  }
}
