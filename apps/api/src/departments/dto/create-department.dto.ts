import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Onboarding' })
  @IsString()
  @MinLength(2)
  nome: string;
}
