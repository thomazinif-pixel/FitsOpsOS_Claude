import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role, Cargo } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 'joao@fitbank.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: 'VIEWER' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ enum: Cargo, example: 'ANALYST' })
  @IsEnum(Cargo)
  cargo: Cargo;

  @ApiProperty({ description: 'ID do departamento do usuário' })
  @IsString()
  departmentId: string;
}
