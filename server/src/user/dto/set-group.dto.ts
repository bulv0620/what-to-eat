import { IsNotEmpty } from 'class-validator';

export class SetGroupDto {
  @IsNotEmpty()
  readonly id: number;

  readonly groupName: string;
}
