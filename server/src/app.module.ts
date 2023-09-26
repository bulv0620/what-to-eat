import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthTokenGuard } from './user/guards/token.guard';
import { APP_GUARD } from '@nestjs/core';
import { GroupModule } from './group/group.module';
import { ItemModule } from './item/item.module';
import { OrderModule } from './order/order.module';
import { VoteModule } from './vote/vote.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UserModule,
    GroupModule,
    ItemModule,
    OrderModule,
    VoteModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthTokenGuard,
    },
  ],
})
export class AppModule {}
