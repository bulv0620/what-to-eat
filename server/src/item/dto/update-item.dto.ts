import { IsNotEmpty } from 'class-validator';
import { Group } from 'src/group/entities/group.entity';

export class UpdateItemDto {
  @IsNotEmpty()
  readonly id: number;

  @IsNotEmpty()
  readonly itemName: string;

  @IsNotEmpty()
  readonly group: Group;
}
