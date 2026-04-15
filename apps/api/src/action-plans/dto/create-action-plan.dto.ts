import { IsString, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPlano } from '@prisma/client';

export class CreateActionPlanDto {
  @ApiProperty()
  @IsString()
  kpiId: string;

  @ApiProperty()
  @IsString()
  descricao: string;

  @ApiProperty()
  @IsString()
  responsavel: string;

  @ApiProperty({ example: '2026-04-30' })
  @IsDateString()
  prazo: string;

  @ApiPropertyOptional({ enum: StatusPlano, default: StatusPlano.PENDENTE })
  @IsEnum(StatusPlano)
  @IsOptional()
  status?: StatusPlano;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  impactoEstimado?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  aiGenerated?: boolean;
}
