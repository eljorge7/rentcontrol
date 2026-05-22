import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { MercadopagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [MercadopagoModule],
  providers: [StoreService],
  controllers: [StoreController]
})
export class StoreModule {}
