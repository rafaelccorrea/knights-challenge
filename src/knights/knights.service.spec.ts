import { Test, TestingModule } from '@nestjs/testing';
import { KnightsService } from './knights.service';

describe('KnightsService', () => {
  let service: KnightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KnightsService],
    }).compile();

    service = module.get<KnightsService>(KnightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
