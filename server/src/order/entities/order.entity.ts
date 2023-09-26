import { Group } from 'src/group/entities/group.entity';
import { Item } from 'src/item/entities/item.entity';
import { Vote } from 'src/vote/entities/vote.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => Item, { cascade: true })
  @JoinTable()
  items: Item[];

  @ManyToOne(() => Group)
  @JoinColumn()
  group: Group;

  @OneToMany(() => Vote, (vote: Vote) => vote.order)
  votes: Vote[];
}
