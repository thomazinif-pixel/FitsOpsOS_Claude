import { Module } from '@nestjs/common';
import { KpiValuesController } from './kpi-values.controller';
import { KpiValuesService } from './kpi-values.service';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [AnalysisModule],
  controllers: [KpiValuesController],
  providers: [KpiValuesService],
  exports: [KpiValuesService],
})
export class KpiValuesModule {}
