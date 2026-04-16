import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.department.findMany({ orderBy: { nome: 'asc' } });
  }

  async create(dto: CreateDepartmentDto) {
    const exists = await this.prisma.department.findUnique({ where: { nome: dto.nome } });
    if (exists) throw new ConflictException('Departamento já existe');
    return this.prisma.department.create({ data: { nome: dto.nome } });
  }

  async update(id: string, dto: CreateDepartmentDto) {
    await this.findOne(id);
    return this.prisma.department.update({ where: { id }, data: { nome: dto.nome } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.department.delete({ where: { id } });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Departamento não encontrado');
    return dept;
  }
}
