import { IsNotEmpty } from 'class-validator';

export class GetItemDto {
  @IsNotEmpty()
  id: number;

  groupName: string;
}
