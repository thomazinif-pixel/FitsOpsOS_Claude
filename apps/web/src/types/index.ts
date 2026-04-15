export type Role = 'ADMIN' | 'VIEWER';
export type Categoria = 'CRESCIMENTO' | 'EFICIENCIA' | 'QUALIDADE' | 'EXPERIENCIA';
export type Unidade = 'PERCENTUAL' | 'DIAS' | 'REAIS' | 'QUANTIDADE';
export type Direcao = 'UP' | 'DOWN';
export type StatusKPI = 'GREEN' | 'YELLOW' | 'RED';
export type Tendencia = 'UP' | 'DOWN' | 'STABLE';
export type StatusPlano = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface KPI {
  id: string;
  nome: string;
  descricao?: string;
  categoria: Categoria;
  unidade: Unidade;
  metaAnual: number;
  metaMensal: number;
  direcao: Direcao;
  peso: number;
  ativo: boolean;
  createdAt: string;
  analyses?: KPIAnalysis[];
  values?: KPIValue[];
  actionPlans?: ActionPlan[];
  _count?: { actionPlans: number };
}

export interface KPIValue {
  id: string;
  kpiId: string;
  mes: number;
  ano: number;
  valorRealizado: number;
  kpi?: KPI;
}

export interface KPIAnalysis {
  id: string;
  kpiId: string;
  mes: number;
  ano: number;
  percentualAtingimento: number;
  status: StatusKPI;
  tendencia: Tendencia;
  kpi?: KPI;
}

export interface ActionPlan {
  id: string;
  kpiId: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: StatusPlano;
  impactoEstimado?: string;
  aiGenerated: boolean;
  kpi?: Pick<KPI, 'id' | 'nome' | 'categoria'>;
}

export interface DashboardSummary {
  mes: number;
  ano: number;
  scoreGeral: number;
  totalKpis: number;
  countGreen: number;
  countYellow: number;
  countRed: number;
  porCategoria: CategorySummary[];
  alertas: AlertItem[];
  rankingMelhores: RankingItem[];
  rankingPiores: RankingItem[];
  tendencias: TendenciaSerie[];
}

export interface CategorySummary {
  categoria: Categoria;
  mediaAtingimento: number;
  green: number;
  yellow: number;
  red: number;
  total: number;
}

export interface AlertItem {
  kpiId: string;
  nome: string;
  categoria: Categoria;
  percentualAtingimento: number;
  tendencia: Tendencia;
}

export interface RankingItem {
  kpiId: string;
  nome: string;
  categoria: Categoria;
  percentualAtingimento: number;
  status: StatusKPI;
}

export interface TendenciaSerie {
  categoria: Categoria;
  series: { mes: number; ano: number; label: string; media: number | null }[];
}

export interface MonthlyInputKPI extends KPI {
  values: KPIValue[];
  analyses: KPIAnalysis[];
}
