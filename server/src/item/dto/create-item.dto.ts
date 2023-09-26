import { Group } from 'src/group/entities/group.entity';
import { ItemType } from '../entities/item.entity';
import { IsNotEmpty } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  type: ItemType;

  @IsNotEmpty()
  itemName: string;

  @IsNotEmpty()
  group: Group;
}
