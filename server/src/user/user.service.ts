import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { map } from 'rxjs';
import { AxiosResponse } from 'axios';
import { WXBizDataCrypt } from './WXBizDataCrypt';
import { SetGroupDto } from './dto/set-group.dto';
import { Group } from 'src/group/entities/group.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  private appid = 'wx8e1dc5d6caaeda97';
  private secret = '5f29417b561462b4b30df5380cf7233a';
  private grant_type = 'authorization_code';

  async login(loginDTO: LoginDTO) {
    const { code, iv, encryptedData } = loginDTO;
    const url = `https://api.weixin.qq.com/sns/jscode2session?grant_type=${this.grant_type}&appid=${this.appid}&secret=${this.secret}&js_code=${code}`;
    const info = await this.reqGetInfo(url); // 获取openid和session_key
    // 如果openid不存在则为新用户
    let user: User = await this.userRepository.findOne({
      where: { openid: info.data.openid },
    });
    if (user) {
      user.avatar = loginDTO.avatar;
      user.nickname = loginDTO.nickname;
      await this.userRepository.save(user);
    } else {
      // 注册插入一条新信息
      const pc = new WXBizDataCrypt(this.appid, info.data?.session_key);
      const data = pc.decryptData(encryptedData, iv);
      user = new User();
      user.openid = info.data.openid;
      user.nickname = loginDTO.nickname;
      user.appid = this.appid;
      user.avatar = loginDTO.avatar;
      user.gender = data.gender;

      await this.userRepository.save(user);
    }
    return {
      token: await this.certificate(user),
    };
  }

  // 生成 token
  async certificate(user: User) {
    const payload = {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
    };
    const token = this.jwtService.sign(payload);
    return token;
  }

  reqGetInfo(url: string): Promise<AxiosResponse> {
    return this.httpService
      .post(url)
      .pipe(map((response) => response))
      .toPromise();
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getUserInfo(user: User) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.activeGroup', 'activeGroup')
      .leftJoinAndSelect('activeGroup.cook', 'cook')
      .where('user.id = :userId', { userId: user.id })
      .getOne();
  }

  async setActiveGroup(user: User, group: SetGroupDto): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    const existingGroup = await this.groupRepository.findOne({
      where: {
        id: group.id,
      },
    });

    if (!existingGroup) {
      throw new BadRequestException('饭团不存在');
    }

    existUser.activeGroup = existingGroup;
    return this.userRepository.save(existUser);
  }
}
