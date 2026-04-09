import { Test, TestingModule } from '@nestjs/testing';
import { FacturaproSettingsController } from './facturapro-settings.controller';

describe('FacturaproSettingsController', () => {
  let controller: FacturaproSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturaproSettingsController],
    }).compile();

    controller = module.get<FacturaproSettingsController>(FacturaproSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
