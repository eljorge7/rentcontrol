import { Test, TestingModule } from '@nestjs/testing';
import { FacturaproSettingsService } from './facturapro-settings.service';

describe('FacturaproSettingsService', () => {
  let service: FacturaproSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturaproSettingsService],
    }).compile();

    service = module.get<FacturaproSettingsService>(FacturaproSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
