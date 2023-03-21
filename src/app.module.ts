import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { KnightsModule } from './knights/knights.module';
import { RedisService } from './redis/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    KnightsModule,
  ],
  controllers: [],
  providers: [RedisService],
})
export class AppModule {}
