import { Test, TestingModule } from '@nestjs/testing';
import { FacturaproService } from './facturapro.service';

describe('FacturaproService', () => {
  let service: FacturaproService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturaproService],
    }).compile();

    service = module.get<FacturaproService>(FacturaproService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
