import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';

@Injectable()
export class ActionPlansService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { kpiId?: string; status?: string }) {
    const where: any = {};
    if (filters.kpiId) where.kpiId = filters.kpiId;
    if (filters.status) where.status = filters.status;
    return this.prisma.actionPlan.findMany({
      where,
      include: { kpi: { select: { id: true, nome: true, categoria: true } } },
      orderBy: { prazo: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.actionPlan.findUnique({
      where: { id },
      include: { kpi: true },
    });
    if (!plan) throw new NotFoundException(`Plano de ação ${id} não encontrado`);
    return plan;
  }

  create(dto: CreateActionPlanDto) {
    return this.prisma.actionPlan.create({
      data: {
        ...dto,
        prazo: new Date(dto.prazo),
      },
      include: { kpi: { select: { id: true, nome: true } } },
    });
  }

  async update(id: string, dto: UpdateActionPlanDto) {
    await this.findOne(id);
    return this.prisma.actionPlan.update({
      where: { id },
      data: {
        ...dto,
        prazo: dto.prazo ? new Date(dto.prazo) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.actionPlan.delete({ where: { id } });
  }
}
