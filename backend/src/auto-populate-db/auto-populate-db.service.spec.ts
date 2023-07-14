import { Test, TestingModule } from '@nestjs/testing';
import { AutoPopulateDbService } from './auto-populate-db.service';

describe('AutoPopulateDbService', () => {
  let service: AutoPopulateDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoPopulateDbService],
    }).compile();

    service = module.get<AutoPopulateDbService>(AutoPopulateDbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
