import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Group } from 'src/group/entities/group.entity';

export class GetOrderDto {
  @IsNotEmpty()
  readonly group: Group;

  @IsNotEmpty()
  @Type(() => Array<Date>)
  readonly date: Date[];
}
