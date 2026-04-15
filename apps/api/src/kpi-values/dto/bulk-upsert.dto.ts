import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpsertKpiValueDto } from './upsert-kpi-value.dto';

export class BulkUpsertDto {
  @ApiProperty({ type: [UpsertKpiValueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertKpiValueDto)
  items: UpsertKpiValueDto[];
}
