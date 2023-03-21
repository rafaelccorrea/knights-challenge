/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export enum WeaponTypes {
  strength = "strength",
  dexterity = "dexterity",
  constitution = "constitution",
  intelligence =  "intelligence",
  wisdom = "wisdom",
  charisma = "charisma"
}

export class WeaponsDto {
  @IsString()
  @ApiProperty({
    required: true,
    description: 'Weapon name',
  })
  name: string;

  @IsNumber()
  @ApiProperty({
    required: true,
    description: 'Weapon mod',
  })
  mod: number;

  @IsString()
  @ApiProperty({
    required: true,
    description: 'Weapon attr',
  })
  attr: WeaponTypes;

  @IsBoolean()
  @ApiProperty({
    required: true,
    description: 'Weapon equipped',
  })
  equipped: true;
}
