import { Item } from 'src/item/entities/item.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column()
  groupName: string;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  users: User[];

  @ManyToOne(() => User, { nullable: true })
  cook: User;

  @OneToMany(() => Item, (item: Item) => item.group)
  items: Item[];
}
