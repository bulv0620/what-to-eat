import { Injectable } from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Vote } from './entities/vote.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  ) {}

  async create(createVoteDto: CreateVoteDto, user: User) {
    let vote = await this.voteRepository
      .createQueryBuilder('vote')
      .innerJoinAndSelect('vote.user', 'user')
      .leftJoinAndSelect('vote.order', 'order')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('order.id = :orderId', { orderId: createVoteDto.order.id })
      .getOne();

    if (!vote) {
      vote = new Vote();
      vote.order = createVoteDto.order;
      vote.user = user;
    }

    vote.isAgree = createVoteDto.isAgree;

    return await this.voteRepository.save(vote);
  }
}
