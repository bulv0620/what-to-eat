import { IsNotEmpty } from 'class-validator';

export class JoinGroupDto {
  @IsNotEmpty()
  groupName: string;
}
