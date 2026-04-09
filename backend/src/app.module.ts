import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { OmniChatProxyController } from './omnichat/omnichat.controller';
import { AppController } from './app.controller';
import { AnnouncementsController } from './announcements/announcements.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { UnitsModule } from './units/units.module';
import { TenantsModule } from './tenants/tenants.module';
import { LeasesModule } from './leases/leases.module';
import { ChargesModule } from './charges/charges.module';
import { PaymentsModule } from './payments/payments.module';
import { MikrotikModule } from './mikrotik/mikrotik.module';
import { InvoicesModule } from './invoices/invoices.module';
import { NetworkProfilesModule } from './network-profiles/network-profiles.module';
import { LeaseServicesModule } from './lease-services/lease-services.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { IncidentsModule } from './incidents/incidents.module';
import { ManagementPlansModule } from './management-plans/management-plans.module';
import { CommissionsModule } from './commissions/commissions.module';
import { EventTypesModule } from './event-types/event-types.module';
import { StripeModule } from './stripe/stripe.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';
import { QuotationsModule } from './quotations/quotations.module';
import { MetricsModule } from './metrics/metrics.module';
import { PdfsModule } from './pdfs/pdfs.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadsModule } from './uploads/uploads.module';
import { TasksModule } from './tasks/tasks.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { PayoutsModule } from './payouts/payouts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FacturaproModule } from './facturapro/facturapro.module';
import { AppsModule } from './apps/apps.module';
import { FacturaproSettingsModule } from './facturapro-settings/facturapro-settings.module';
import { SaasOnboardingModule } from './saas-onboarding/saas-onboarding.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false }
    }),
    PrismaModule, ScheduleModule.forRoot(), PropertiesModule, UnitsModule, TenantsModule, LeasesModule, ChargesModule, PaymentsModule, MikrotikModule, InvoicesModule, NetworkProfilesModule, LeaseServicesModule, ChatModule, AuthModule, UsersModule, ExpensesModule, IncidentsModule, ManagementPlansModule, CommissionsModule, EventTypesModule, StripeModule, MercadopagoModule, QuotationsModule, MetricsModule, PdfsModule, VouchersModule, SuppliersModule, UploadsModule, TasksModule, ChecklistsModule, PayoutsModule, NotificationsModule, FacturaproModule, AppsModule, FacturaproSettingsModule, SaasOnboardingModule, SettingsModule
  ],
  controllers: [AppController, AnnouncementsController, OmniChatProxyController],
  providers: [AppService],
})
export class AppModule {}
