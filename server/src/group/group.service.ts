import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto, creator: User): Promise<Group> {
    const existingGroup = await this.groupRepository.findOne({
      where: { groupName: createGroupDto.groupName },
    });

    if (existingGroup) {
      throw new BadRequestException('名称已存在');
    }

    const group = this.groupRepository.create({
      ...createGroupDto,
      cook: creator,
      users: [creator],
    });

    return this.groupRepository.save(group);
  }

  findAll(creator: User) {
    return this.groupRepository
      .createQueryBuilder('group')
      .innerJoinAndSelect('group.cook', 'cook')
      .innerJoin('group.users', 'user', 'user.id = :userId', {
        userId: creator.id,
      })
      .getMany();
  }

  async joinGroup(user: User, groupName: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { groupName },
      relations: { users: true },
    });

    if (!group) {
      throw new BadRequestException('饭团不存在');
    }

    if (group.users.find((existedUser) => existedUser.id === user.id)) {
      throw new BadRequestException('已加入该饭团');
    }

    group.users = [...group.users, user];

    await this.groupRepository.save(group);

    return group;
  }
}
