import { IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertKpiValueDto {
  @ApiProperty()
  @IsString()
  kpiId: string;

  @ApiProperty({ example: 3, description: '1-12' })
  @IsNumber()
  @Min(1)
  @Max(12)
  mes: number;

  @ApiProperty({ example: 2026 })
  @IsNumber()
  @Min(2020)
  ano: number;

  @ApiProperty({ example: 520 })
  @IsNumber()
  valorRealizado: number;
}
