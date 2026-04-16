import { PrismaClient, Categoria, Unidade, Direcao, StatusPlano } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_YEAR = 2026;

function computeAtingimento(realizado: number, meta: number, direcao: Direcao): number {
  if (direcao === 'UP') return (realizado / meta) * 100;
  return (meta / realizado) * 100;
}

function computeStatus(pct: number): 'GREEN' | 'YELLOW' | 'RED' {
  if (pct >= 100) return 'GREEN';
  if (pct >= 80) return 'YELLOW';
  return 'RED';
}

function computeTendencia(current: number, previous: number | null): 'UP' | 'DOWN' | 'STABLE' {
  if (previous === null) return 'STABLE';
  if (current > previous) return 'UP';
  if (current < previous) return 'DOWN';
  return 'STABLE';
}

const kpisData = [
  // CRESCIMENTO
  { nome: 'Captação de Novos Clientes', descricao: 'Total de novos clientes adquiridos no mês', categoria: Categoria.CRESCIMENTO, unidade: Unidade.QUANTIDADE, metaAnual: 6000, metaMensal: 500, direcao: Direcao.UP, peso: 1.5 },
  { nome: 'Volume de Transações', descricao: 'Valor total transacionado em R$ no mês', categoria: Categoria.CRESCIMENTO, unidade: Unidade.REAIS, metaAnual: 600000000, metaMensal: 50000000, direcao: Direcao.UP, peso: 2.0 },
  { nome: 'Novos Produtos Contratados', descricao: 'Quantidade de novos produtos ativados', categoria: Categoria.CRESCIMENTO, unidade: Unidade.QUANTIDADE, metaAnual: 14400, metaMensal: 1200, direcao: Direcao.UP, peso: 1.2 },

  // EFICIÊNCIA
  { nome: 'Tempo Médio de Processamento', descricao: 'Tempo médio em dias para processar uma transação', categoria: Categoria.EFICIENCIA, unidade: Unidade.DIAS, metaAnual: 2, metaMensal: 2, direcao: Direcao.DOWN, peso: 1.5 },
  { nome: 'Taxa de Automação de Processos', descricao: 'Percentual de processos automatizados', categoria: Categoria.EFICIENCIA, unidade: Unidade.PERCENTUAL, metaAnual: 75, metaMensal: 75, direcao: Direcao.UP, peso: 1.3 },
  { nome: 'Custo por Transação', descricao: 'Custo médio em R$ por transação processada', categoria: Categoria.EFICIENCIA, unidade: Unidade.REAIS, metaAnual: 0.85, metaMensal: 0.85, direcao: Direcao.DOWN, peso: 1.0 },

  // QUALIDADE
  { nome: 'Taxa de Erros Operacionais', descricao: 'Percentual de operações com erros', categoria: Categoria.QUALIDADE, unidade: Unidade.PERCENTUAL, metaAnual: 0.5, metaMensal: 0.5, direcao: Direcao.DOWN, peso: 2.0 },
  { nome: 'SLA Atendimento Cumprido', descricao: 'Percentual de atendimentos dentro do SLA', categoria: Categoria.QUALIDADE, unidade: Unidade.PERCENTUAL, metaAnual: 95, metaMensal: 95, direcao: Direcao.UP, peso: 1.8 },
  { nome: 'Retrabalho por Processo', descricao: 'Quantidade de reprocessamentos no mês', categoria: Categoria.QUALIDADE, unidade: Unidade.QUANTIDADE, metaAnual: 50, metaMensal: 50, direcao: Direcao.DOWN, peso: 1.0 },

  // EXPERIÊNCIA
  { nome: 'NPS Operacional', descricao: 'Net Promoter Score da operação', categoria: Categoria.EXPERIENCIA, unidade: Unidade.QUANTIDADE, metaAnual: 70, metaMensal: 70, direcao: Direcao.UP, peso: 2.0 },
  { nome: 'Tempo de Resposta ao Cliente', descricao: 'Tempo médio em dias para responder ao cliente', categoria: Categoria.EXPERIENCIA, unidade: Unidade.DIAS, metaAnual: 1, metaMensal: 1, direcao: Direcao.DOWN, peso: 1.5 },
  { nome: 'Satisfação Interna da Equipe', descricao: 'Percentual de satisfação da equipe operacional', categoria: Categoria.EXPERIENCIA, unidade: Unidade.PERCENTUAL, metaAnual: 80, metaMensal: 80, direcao: Direcao.UP, peso: 1.0 },
];

const monthlyPerformance: Record<string, number[]> = {
  'Captação de Novos Clientes':    [1.05, 0.92, 1.10],
  'Volume de Transações':          [0.98, 1.03, 1.08],
  'Novos Produtos Contratados':    [0.88, 0.91, 0.72],
  'Tempo Médio de Processamento':  [1.10, 0.95, 1.20],
  'Taxa de Automação de Processos':[0.95, 0.97, 1.02],
  'Custo por Transação':           [0.98, 1.05, 1.15],
  'Taxa de Erros Operacionais':    [0.90, 1.00, 1.30],
  'SLA Atendimento Cumprido':      [1.02, 0.99, 0.97],
  'Retrabalho por Processo':       [0.85, 0.90, 0.95],
  'NPS Operacional':               [0.96, 1.00, 0.75],
  'Tempo de Resposta ao Cliente':  [0.95, 1.00, 0.98],
  'Satisfação Interna da Equipe':  [1.05, 1.02, 1.08],
};

// Department → KPI names mapping
const deptKpiMap: Record<string, string[]> = {
  'Onboarding': ['Captação de Novos Clientes', 'Novos Produtos Contratados'],
  'Fast Track': ['Tempo Médio de Processamento', 'Taxa de Automação de Processos'],
  'N1': ['SLA Atendimento Cumprido', 'Tempo de Resposta ao Cliente', 'Retrabalho por Processo'],
  'Sandbox': ['Volume de Transações', 'Custo por Transação'],
  'Excelência Operacional': ['Taxa de Erros Operacionais', 'NPS Operacional', 'Satisfação Interna da Equipe'],
};

async function main() {
  console.log('🌱 Iniciando seed V2 do banco de dados...');

  // 1. Limpar dados existentes
  await prisma.actionPlan.deleteMany();
  await prisma.kPIAnalysis.deleteMany();
  await prisma.kPIValue.deleteMany();
  await prisma.kPI.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Dados anteriores removidos');

  // 2. Criar departamentos
  const deptNames = Object.keys(deptKpiMap);
  const departments: Record<string, any> = {};
  for (const nome of deptNames) {
    const dept = await prisma.department.create({ data: { nome } });
    departments[nome] = dept;
  }
  console.log(`✅ ${deptNames.length} departamentos criados`);

  // 3. Criar usuários V2
  const adminHash = await bcrypt.hash('Felipe@2026', 12);
  const viewerHash = await bcrypt.hash('Viewer@2026', 12);
  const managerHash = await bcrypt.hash('Fitbank@2026', 12);

  const admin = await prisma.user.create({
    data: { nome: 'Felipe Thomazini', email: 'admin@fitbank.com', passwordHash: adminHash, role: 'ADMIN', cargo: 'COO' },
  });
  const viewer = await prisma.user.create({
    data: { nome: 'Viewer Fitbank', email: 'viewer@fitbank.com', passwordHash: viewerHash, role: 'VIEWER', cargo: 'ANALYST' },
  });
  const manager1 = await prisma.user.create({
    data: { nome: 'Ana Lima', email: 'ana.lima@fitbank.com', passwordHash: managerHash, role: 'MANAGER', cargo: 'MANAGER' },
  });
  const manager2 = await prisma.user.create({
    data: { nome: 'Carlos Souza', email: 'carlos.souza@fitbank.com', passwordHash: managerHash, role: 'MANAGER', cargo: 'MANAGER' },
  });
  console.log('✅ Usuários V2 criados');

  // Mapa KPI nome → owner e dept
  const kpiOwners: Record<string, string> = {
    'Captação de Novos Clientes': manager1.id,
    'Novos Produtos Contratados': manager1.id,
    'Tempo Médio de Processamento': manager2.id,
    'Taxa de Automação de Processos': manager2.id,
    'SLA Atendimento Cumprido': manager1.id,
    'Tempo de Resposta ao Cliente': manager1.id,
    'Retrabalho por Processo': manager2.id,
    'Volume de Transações': manager2.id,
    'Custo por Transação': manager2.id,
    'Taxa de Erros Operacionais': manager1.id,
    'NPS Operacional': manager1.id,
    'Satisfação Interna da Equipe': manager2.id,
  };

  // Build reverse map KPI name → dept id
  const kpiDeptMap: Record<string, string> = {};
  for (const [deptNome, kpiNames] of Object.entries(deptKpiMap)) {
    for (const kpiNome of kpiNames) {
      kpiDeptMap[kpiNome] = departments[deptNome].id;
    }
  }

  // 4. Criar KPIs
  const createdKpis: any[] = [];
  for (const kpiData of kpisData) {
    const kpi = await prisma.kPI.create({
      data: {
        ...kpiData,
        ownerId: kpiOwners[kpiData.nome] || null,
        departmentId: kpiDeptMap[kpiData.nome] || null,
      },
    });
    createdKpis.push(kpi);
  }
  console.log(`✅ ${createdKpis.length} KPIs criados com owner e departamento`);

  // 5. Criar valores mensais e análises
  const months = [1, 2, 3];
  for (const kpi of createdKpis) {
    const multipliers = monthlyPerformance[kpi.nome] || [1.0, 1.0, 1.0];
    let previousValue: number | null = null;

    for (let i = 0; i < months.length; i++) {
      const mes = months[i];
      const multiplier = multipliers[i];
      const valorRealizado = Math.round(kpi.metaMensal * multiplier * 100) / 100;

      await prisma.kPIValue.create({
        data: { kpiId: kpi.id, mes, ano: SEED_YEAR, valorRealizado },
      });

      const percentualAtingimento = computeAtingimento(valorRealizado, kpi.metaMensal, kpi.direcao);
      const status = computeStatus(percentualAtingimento);
      const tendencia = computeTendencia(valorRealizado, previousValue);

      await prisma.kPIAnalysis.create({
        data: {
          kpiId: kpi.id,
          mes,
          ano: SEED_YEAR,
          percentualAtingimento: Math.round(percentualAtingimento * 10) / 10,
          status,
          tendencia,
        },
      });

      previousValue = valorRealizado;
    }
  }
  console.log('✅ Valores e análises criados para Jan-Mar 2026');

  // 6. Criar planos de ação
  const redAnalyses = await prisma.kPIAnalysis.findMany({
    where: { mes: 3, ano: SEED_YEAR, status: 'RED' },
    include: { kpi: true },
  });

  const actionPlansData = [
    {
      descricao: 'Revisar pipeline de onboarding digital e reduzir fricção no cadastro',
      responsavel: 'Ana Lima',
      prazo: new Date('2026-04-30'),
      status: StatusPlano.EM_ANDAMENTO,
      impactoEstimado: '+15% no atingimento da meta mensal',
    },
    {
      descricao: 'Implementar campanha de reativação de leads qualificados',
      responsavel: 'Carlos Souza',
      prazo: new Date('2026-04-15'),
      status: StatusPlano.PENDENTE,
      impactoEstimado: '+8% na captação de novos clientes',
    },
    {
      descricao: 'Auditoria de processos críticos e mapeamento de pontos de falha',
      responsavel: 'Felipe Thomazini',
      prazo: new Date('2026-04-20'),
      status: StatusPlano.EM_ANDAMENTO,
      impactoEstimado: 'Redução de 30% nos erros operacionais',
    },
  ];

  for (let i = 0; i < redAnalyses.length; i++) {
    const plan = actionPlansData[i % actionPlansData.length];
    await prisma.actionPlan.create({
      data: { ...plan, kpiId: redAnalyses[i].kpiId },
    });
  }
  console.log(`✅ ${redAnalyses.length} planos de ação criados`);

  console.log('\n🎉 Seed V2 concluído!');
  console.log('📧 Credenciais:');
  console.log('   Admin:   admin@fitbank.com    / Felipe@2026');
  console.log('   Viewer:  viewer@fitbank.com   / Viewer@2026');
  console.log('   Manager: ana.lima@fitbank.com / Fitbank@2026');
  console.log('   Manager: carlos.souza@fitbank.com / Fitbank@2026');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
