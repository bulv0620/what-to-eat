import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post('create')
  create(@Body() createGroupDto: CreateGroupDto, @Request() req: any) {
    return this.groupService.create(createGroupDto, req.user);
  }

  @Get('list')
  findAll(@Request() req: any) {
    return this.groupService.findAll(req.user);
  }

  @Post('join')
  joinGroup(@Body() joinGroupDto: JoinGroupDto, @Request() req: any) {
    return this.groupService.joinGroup(req.user, joinGroupDto.groupName);
  }
}
