import { IsNotEmpty } from 'class-validator';

export class LoginDTO {
  readonly iv: string;

  readonly encryptedData: string;

  @IsNotEmpty()
  readonly code: string;

  @IsNotEmpty()
  readonly avatar: string;

  @IsNotEmpty()
  readonly nickname: string;
}
