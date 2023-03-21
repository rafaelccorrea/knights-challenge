import { Module } from '@nestjs/common';
import { KnightsService } from './knights.service';
import { KnightsController } from './knights.controller';
import { KnightSchema } from './schemas/knights.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisService } from 'src/redis/redis';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Knight',
        schema: KnightSchema,
      },
    ]),
  ],
  providers: [KnightsService, RedisService],
  controllers: [KnightsController],
})
export class KnightsModule {}
