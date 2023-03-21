/* eslint-disable prettier/prettier */
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { WeaponsDto } from './create-weapons.dto';

export enum KnightTypes {
  STRENGTH = "strength",
  DEXTERITY = "dexterity",
  CONSTITUTION = "constitution",
  INTELLIGENCE =  "intelligence",
  WISDOM = "wisdom",
  CHARISMA = "charisma"
}

export class CreateKnightDto {
  @ApiResponseProperty()
  id: string;

  @ApiProperty({
    required: true,
    description: 'Knight title',
  })
  @IsString()
  name: string;

  @ApiProperty({
    required: true,
    description: 'Knight nickname',
  })
  @IsString()
  nickname: string;

  @ApiProperty({
    required: true,
    description: 'Knight birthday',
  })
  @IsString()
  birthday: string;

  @ApiProperty({
    type: WeaponsDto,
    required: true,
    description: 'knight equipment',
  })
  @ValidateNested({ each: true })
  @Type(() => WeaponsDto)
  weapons: WeaponsDto[];

  @ApiProperty({
    required: true,
    description: 'Knight keyAttribute',
  })
  @IsString()
  keyAttribute: KnightTypes;
}
