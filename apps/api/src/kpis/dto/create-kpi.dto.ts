import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Categoria, Unidade, Direcao } from '@prisma/client';

export class CreateKpiDto {
  @ApiProperty({ example: 'Captação de Novos Clientes' })
  @IsString()
  nome: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ enum: Categoria })
  @IsEnum(Categoria)
  categoria: Categoria;

  @ApiProperty({ enum: Unidade })
  @IsEnum(Unidade)
  unidade: Unidade;

  @ApiProperty({ example: 6000 })
  @IsNumber()
  metaAnual: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  metaMensal: number;

  @ApiProperty({ enum: Direcao })
  @IsEnum(Direcao)
  direcao: Direcao;

  @ApiProperty({ example: 1.0 })
  @IsNumber()
  @Min(0.1)
  peso: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @ApiProperty({ description: 'ID do usuário responsável pelo KPI' })
  @IsString()
  ownerId: string;

  @ApiPropertyOptional({ description: 'ID do departamento do KPI' })
  @IsString()
  @IsOptional()
  departmentId?: string;
}
