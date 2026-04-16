import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { UpdateKpiDto } from './dto/update-kpi.dto';

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { categoria?: string; ativo?: string; search?: string }) {
    const where: any = {};
    if (filters.categoria) where.categoria = filters.categoria;
    if (filters.ativo !== undefined) where.ativo = filters.ativo === 'true';
    if (filters.search) where.nome = { contains: filters.search, mode: 'insensitive' };

    return this.prisma.kPI.findMany({
      where,
      orderBy: { nome: 'asc' },
      include: {
        analyses: { orderBy: [{ ano: 'desc' }, { mes: 'desc' }], take: 1 },
        _count: { select: { actionPlans: { where: { status: { not: 'CONCLUIDO' } } } } },
        owner: { select: { id: true, nome: true, email: true, cargo: true } },
        department: { select: { id: true, nome: true } },
      },
    });
  }

  async findOne(id: string) {
    const kpi = await this.prisma.kPI.findUnique({
      where: { id },
      include: {
        analyses: { orderBy: [{ ano: 'desc' }, { mes: 'desc' }] },
        actionPlans: { orderBy: { createdAt: 'desc' } },
        values: { orderBy: [{ ano: 'desc' }, { mes: 'desc' }] },
        owner: { select: { id: true, nome: true, email: true, cargo: true } },
        department: { select: { id: true, nome: true } },
      },
    });
    if (!kpi) throw new NotFoundException(`KPI ${id} não encontrado`);
    return kpi;
  }

  create(dto: CreateKpiDto) {
    return this.prisma.kPI.create({ data: dto });
  }

  async update(id: string, dto: UpdateKpiDto) {
    await this.findOne(id);
    return this.prisma.kPI.update({ where: { id }, data: dto });
  }

  async softDelete(id: string) {
    await this.findOne(id);
    return this.prisma.kPI.update({ where: { id }, data: { ativo: false } });
  }
}
