import { Group } from 'src/group/entities/group.entity';
import { Order } from 'src/order/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ItemType {
  HalfMeatDish = 'halfMeatDish',
  MeatDish = 'meatDish',
  VegetableDish = 'vegetableDish',
}

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ type: 'enum', enum: ItemType })
  type: ItemType;

  @Column()
  itemName: string;

  @ManyToOne(() => Group, (group: Group) => group.items)
  group: Group;

  @ManyToMany(() => Order, (order: Order) => order.items)
  orders: Order[];
}
