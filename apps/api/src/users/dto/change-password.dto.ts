import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  senhaAtual: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  novaSenha: string;
}
