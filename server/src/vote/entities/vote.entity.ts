import { Order } from 'src/order/entities/order.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column()
  isAgree: boolean;

  @ManyToOne(() => Order)
  @JoinColumn()
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
