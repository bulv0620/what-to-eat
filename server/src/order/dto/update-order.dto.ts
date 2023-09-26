import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Group } from 'src/group/entities/group.entity';
import { Item } from 'src/item/entities/item.entity';

export class UpdateOrderDto {
  @IsNotEmpty()
  readonly group: Group;

  @IsNotEmpty()
  @Type(() => Array<Date>)
  readonly date: Date[];

  @IsOptional()
  readonly items?: Item[];

  @IsOptional()
  readonly removeItems?: Item[];
}
