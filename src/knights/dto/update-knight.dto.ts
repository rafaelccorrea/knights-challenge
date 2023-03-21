/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateKnightDto {
  @ApiProperty({
    required: true,
    description: 'Knight update nickname',
  })
  @IsString()
  nickname: string;
}
