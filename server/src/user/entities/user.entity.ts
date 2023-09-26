import { Group } from 'src/group/entities/group.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column('text')
  openid: string;

  @Column({
    default: false,
  })
  isDelete: false;

  @Column('text')
  nickname: string;

  @Column('text')
  avatar: string;

  @Column()
  gender: number;

  @Column('text', { default: null })
  mobile: string;

  @Column('text')
  appid: string;

  @ManyToMany(() => Group, (group: Group) => group.users)
  groups: Group[];

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn()
  activeGroup: Group;
}
