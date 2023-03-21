import { Test, TestingModule } from '@nestjs/testing';
import { KnightsController } from './knights.controller';

describe('KnightsController', () => {
  let controller: KnightsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnightsController],
    }).compile();

    controller = module.get<KnightsController>(KnightsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
