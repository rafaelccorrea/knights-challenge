/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export type KnightDocument = Knight & Document;

@Schema()
export class Knight {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  birthday: Date;

  @Prop([
    {
      name: { type: String, required: true },
      mod: { type: Number, required: true },
      attr: { type: String, required: true },
      equipped: { type: Boolean, required: true },
    },
  ])
  weapons: {
    _id: string;
    name: string;
    mod: number;
    attr: string;
    equipped: boolean;
  }[];

  @Prop({
    type: Map,
    of: Number,
    default: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
  })
  attributes: Record<string, number>;

  @Prop({ required: true })
  keyAttribute: string;
}


export const KnightSchema = SchemaFactory.createForClass(Knight);

KnightSchema.plugin(mongoosePaginate)