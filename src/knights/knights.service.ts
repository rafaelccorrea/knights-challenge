import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { differenceInYears, format, parseISO } from 'date-fns';
import { Model, PaginateModel } from 'mongoose';
import { RedisService } from 'src/redis/redis';
import { CreateKnightDto } from './dto/create-knight.dto';
import { UpdateKnightDto } from './dto/update-knight.dto';
import { ListKnightsFilter, ListKnightsResponse } from './knights.types';
import { Knight, KnightDocument } from './schemas/knights.schema';

interface AttributeMod {
  min: number;
  max: number;
  value: number;
}

const attributeMods: AttributeMod[] = [
  { min: 0, max: 8, value: -2 },
  { min: 9, max: 10, value: -1 },
  { min: 11, max: 12, value: 0 },
  { min: 13, max: 15, value: 1 },
  { min: 16, max: 18, value: 2 },
  { min: 19, max: Infinity, value: 3 },
];

const calculateAttributeMod = (value: number): number => {
  const attributeMod = attributeMods.find(
    (mod) => mod.min <= value && mod.max >= value,
  );
  return attributeMod ? attributeMod.value : 0;
};

const calculateExp = (birthday) => {
  const ageDifference = differenceInYears(new Date(), birthday) - 7;
  return ageDifference > 7 ? Math.floor(ageDifference * Math.pow(22, 1.45)) : 0;
};

const calculateAge = (birthday) => {
  const ageInMilliseconds = Date.now() - new Date(birthday).getTime();
  const ageInYears = Math.floor(
    ageInMilliseconds / (1000 * 60 * 60 * 24 * 365),
  );
  return ageInYears;
};

function calculateAttack(character: any): number {
  const keyAttr = character?.keyAttribute;
  const age = calculateAge(character.birthday);
  if (age > 7) {
    const equippedWeapon = character.weapons.find((weapon) => weapon.equipped);
    const att =
      character.attributes[keyAttr] !== undefined
        ? character.attributes[keyAttr]
        : character.attributes.get(keyAttr);
    const attack = 10 + calculateAttributeMod(att) + equippedWeapon.mod;
    return attack;
  }
  return 0;
}

@Injectable()
export class KnightsService {
  private readonly logger = new Logger(KnightsService.name);
  constructor(
    private readonly redisClient: RedisService,
    @InjectModel('Knight') private readonly knightModel: Model<KnightDocument>,
    @InjectModel(Knight.name)
    private knightPaginateModel: PaginateModel<KnightDocument>,
  ) {}

  async create(knight: CreateKnightDto): Promise<Knight> {
    this.logger.log({
      method: 'create',
      title: 'starting-method',
      body: {
        knight,
      },
    });

    try {
      const Knight = await this.knightModel.findOne({
        nickname: knight.nickname,
      });

      if (Knight)
        throw new BadRequestException('This nickname is already being used!');

      const equippedWeapons = knight.weapons.filter(
        (weapon) => weapon.equipped === true,
      );

      if (equippedWeapons.length > 1)
        throw new BadRequestException(
          'There is more than one weapon equipped!',
        );

      if (equippedWeapons.length === 0)
        throw new BadRequestException('You must equip at least one weapon!');

      knight.birthday = format(parseISO(knight.birthday), 'dd-MM-yyyy');

      const newKnight = new this.knightModel(knight);
      const savedKnight = await newKnight.save();

      this.logger.log({
        method: 'create',
        title: 'finishing-method',
      });

      return savedKnight;
    } catch (error) {
      if (error?.response) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new BadRequestException({ error: error.response.message });
      }
      throw new InternalServerErrorException(
        'Unexpected error trying to create knight',
      );
    }
  }

  async deleteKnight(id: string) {
    const knight = await this.knightModel.findById(id).exec();

    if (!knight) {
      throw new NotFoundException(`Knight with id ${id} not found`);
    }

    knight.toObject({ getters: true });

    await this.redisClient.set('heroes-knights', JSON.stringify(knight));

    const deletedKnight = await this.knightModel.deleteOne({ _id: id }).exec();

    if (deletedKnight.deletedCount === 1)
      return { message: 'Knight fought the good fight!' };
  }

  async getByIdKnight(id: string) {
    const knight = await this.knightModel.findById(id);

    this.logger.log({
      method: 'findById',
      title: 'finishing-method',
    });

    if (!knight) {
      throw new NotFoundException(`Knight with id ${id} not found`);
    }

    const weapons = knight.weapons.map(
      ({ name, mod, attr, equipped, _id }) => ({
        name,
        mod,
        attr,
        equipped,
        _id,
      }),
    );

    const character = {
      keyAttribute: knight.keyAttribute,
      attributes: knight.attributes,
      weapons: knight.weapons,
      birthday: knight.birthday,
    };

    const attack = calculateAttack(character);

    return {
      name: knight.name,
      nickname: knight.nickname,
      age: calculateAge(knight.birthday),
      exp: calculateExp(knight.birthday),
      attack,
      weapons,
      attributes: knight.attributes,
    };
  }

  async getAllKnights(filter: ListKnightsFilter): Promise<ListKnightsResponse> {
    this.logger.log({
      method: 'findAll',
      title: 'starting-method',
      body: {
        filter,
      },
    });

    if (!filter.page) {
      filter.page = 1;
    }
    if (!filter.pageSize) {
      filter.pageSize = 20;
    }

    const options = {
      page: filter.page,
      limit: filter.pageSize,
      filter: filter.term,
      sort: { name: 1 }, // ordena pelo nome em ordem crescente
      lean: true, // retorna os resultados como objetos Javascript em vez de Documents do Mongoose
      select: 'name birthday keyAttribute weapons attributes nickname', // seleciona somente os campos que serão usados na resposta
    };

    const result = await this.knightPaginateModel.paginate({}, options);

    if (filter.term === 'heroes') {
      const cachedKnights = await this.redisClient.get('heroes-knights');
      if (!cachedKnights) {
        throw new BadRequestException('Not found heroes!');
      }
      const heroKnights = JSON.parse(cachedKnights);

      const result = {
        name: heroKnights.name,
        nickname: heroKnights.nickname,
        age: calculateAge(heroKnights.birthday),
        weapons: heroKnights.weapons.length,
        attribute: heroKnights.keyAttribute,
        attack: calculateAttack(heroKnights),
        exp: calculateExp(parseISO(heroKnights.birthday)),
      };

      const response: ListKnightsResponse = {
        total: 0,
        currentPage: 1,
        pageSize: 10,
        data: result,
      };

      return response;
    }

    const data = result.docs.map((doc) => {
      return {
        id: doc.id,
        name: doc.name,
        nickname: doc.nickname,
        age: calculateAge(doc.birthday),
        weapons: doc.weapons.length,
        attribute: doc.keyAttribute,
        attack: calculateAttack(doc),
        exp: calculateExp(doc.birthday),
      };
    });

    const response: ListKnightsResponse = {
      total: result.totalDocs,
      currentPage: result.page,
      pageSize: result.limit,
      data,
    };

    this.logger.log({
      method: 'findAll',
      title: 'finishing-method',
    });
    return response;
  }

  async updateKnight(
    id: string,
    updateKnightDto: UpdateKnightDto,
  ): Promise<Knight> {
    const knight = await this.knightModel.findById(id).exec();

    if (!knight) {
      throw new NotFoundException(`Knight with id ${id} not found`);
    }

    knight.nickname = updateKnightDto.nickname;

    return knight.save();
  }
}
