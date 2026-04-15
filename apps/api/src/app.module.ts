import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KpisModule } from './kpis/kpis.module';
import { KpiValuesModule } from './kpi-values/kpi-values.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ActionPlansModule } from './action-plans/action-plans.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AiModule } from './ai/ai.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    KpisModule,
    KpiValuesModule,
    AnalysisModule,
    ActionPlansModule,
    DashboardModule,
    AiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
