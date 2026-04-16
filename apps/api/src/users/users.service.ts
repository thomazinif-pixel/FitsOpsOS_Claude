import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

const SELECT_USER = {
  id: true, nome: true, email: true, role: true, cargo: true,
  status: true, ultimoLogin: true, createdAt: true, updatedAt: true,
  departmentId: true,
  department: { select: { id: true, nome: true } },
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: SELECT_USER });
  }

  findAll() {
    return this.prisma.user.findMany({ select: SELECT_USER, orderBy: { nome: 'asc' } });
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email já cadastrado');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { nome: dto.nome, email: dto.email, passwordHash, role: dto.role, cargo: dto.cargo, departmentId: dto.departmentId },
      select: SELECT_USER,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureExists(id);
    return this.prisma.user.update({ where: { id }, data: dto, select: SELECT_USER });
  }

  async setStatus(id: string, status: 'ACTIVE' | 'BLOCKED') {
    await this.ensureExists(id);
    return this.prisma.user.update({ where: { id }, data: { status }, select: SELECT_USER });
  }

  async resetPassword(id: string) {
    await this.ensureExists(id);
    const passwordHash = await bcrypt.hash('Fitbank@2026', 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Senha resetada para: Fitbank@2026' };
  }

  async changePassword(id: string, senhaAtual: string, novaSenha: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const valid = await bcrypt.compare(senhaAtual, user.passwordHash);
    if (!valid) throw new BadRequestException('Senha atual incorreta');
    const passwordHash = await bcrypt.hash(novaSenha, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Senha alterada com sucesso' };
  }

  async updateUltimoLogin(id: string) {
    await this.prisma.user.update({ where: { id }, data: { ultimoLogin: new Date() } });
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}
