import { Controller, Post, Body, Request } from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  create(@Body() createVoteDto: CreateVoteDto, @Request() req: any) {
    return this.voteService.create(createVoteDto, req.user);
  }
}
