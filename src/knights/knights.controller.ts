import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateKnightDto } from './dto/create-knight.dto';
import { UpdateKnightDto } from './dto/update-knight.dto';
import { KnightsService } from './knights.service';
import { ListKnightsFilter, ListKnightsResponse } from './knights.types';
import { Knight } from './schemas/knights.schema';

@ApiTags('knights')
@Controller('v1/knights')
export class KnightsController {
  constructor(private readonly knightsService: KnightsService) {}

  @Delete(':id')
  async deleteKnight(@Param('id') id: string) {
    return await this.knightsService.deleteKnight(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateKnightDto })
  async updateKnight(
    @Param('id') id: string,
    @Body() updateKnightDto: UpdateKnightDto,
  ): Promise<Knight> {
    return this.knightsService.updateKnight(id, updateKnightDto);
  }

  @Get(':id')
  async getKnightById(@Param('id') id: string) {
    const knight = await this.knightsService.getByIdKnight(id);
    return knight;
  }

  @Get()
  @HttpCode(200)
  @ApiQuery({
    name: 'term',
    required: false,
    description: 'term to be searched for',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page, i.e., what page should be returned',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Page size, i.e., number of lists per page',
  })
  async findAll(
    @Query('term') term: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<ListKnightsResponse> {
    const getKnights: ListKnightsFilter = {
      term,
      page,
      pageSize,
    };

    if (!page) {
      getKnights.page = 1;
    }
    if (page < 1) {
      throw new BadRequestException(
        'Invalid page. Page number should be positive',
      );
    }

    if (!pageSize) {
      getKnights.pageSize = 20;
    }
    if (pageSize < 1) {
      throw new BadRequestException(
        'Invalid page size. Page size should be at least 1',
      );
    }

    return await this.knightsService.getAllKnights(getKnights);
  }

  @Post()
  @ApiBody({ type: CreateKnightDto })
  @ApiResponse({ description: 'Successfully created knight' })
  async create(@Body(new ValidationPipe()) knight: CreateKnightDto) {
    await this.knightsService.create(knight);
    return {
      message: 'Successfully created knight!',
    };
  }
}
