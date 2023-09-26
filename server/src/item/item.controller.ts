import { Controller, Post, Body } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { GetItemDto } from './dto/get-item.dto';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post('create')
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Post('list')
  findAll(@Body() getItemDto: GetItemDto) {
    return this.itemService.findAll(getItemDto);
  }
}
