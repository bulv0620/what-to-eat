import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Order } from 'src/order/entities/order.entity';

export class CreateVoteDto {
  @IsNotEmpty()
  readonly order: Order;

  @IsNotEmpty()
  @Type(() => Boolean)
  readonly isAgree: boolean;
}
