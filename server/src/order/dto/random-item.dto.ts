import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Group } from 'src/group/entities/group.entity';
import { ItemType } from 'src/item/entities/item.entity';

export class RandomItemDto {
  @IsNotEmpty()
  readonly group: Group;

  @IsNotEmpty()
  @Type(() => Array<Date>)
  readonly date: Date[];

  @IsNotEmpty()
  readonly type: ItemType;
}
