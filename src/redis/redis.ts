/* eslint-disable prettier/prettier */
import { Redis } from 'ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService extends Redis {
  constructor() {
    super({
      host: 'localhost',
      password: 'knights',
      port: 6379,
    });

    super.on('error', (err) => {
      console.log('Error on Redis');
      console.log(err);
      process.exit(1);
    });

    super.on('Connect', () => {
      console.log('Redis connected!');
    });
  }
}
