export type Role = 'ADMIN' | 'MANAGER' | 'VIEWER';
export type Cargo = 'COO' | 'MANAGER' | 'ANALYST';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type Categoria = 'CRESCIMENTO' | 'EFICIENCIA' | 'QUALIDADE' | 'EXPERIENCIA';
export type Unidade = 'PERCENTUAL' | 'DIAS' | 'REAIS' | 'QUANTIDADE';
export type Direcao = 'UP' | 'DOWN';
export type StatusKPI = 'GREEN' | 'YELLOW' | 'RED';
export type Tendencia = 'UP' | 'DOWN' | 'STABLE';
export type StatusPlano = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  cargo: Cargo;
  status: UserStatus;
  ultimoLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  departmentId?: string;
  department?: Pick<Department, 'id' | 'nome'>;
}

export interface Department {
  id: string;
  nome: string;
  createdAt?: string;
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
  ownerId?: string;
  departmentId?: string;
  owner?: Pick<User, 'id' | 'nome' | 'email' | 'cargo'>;
  department?: Pick<Department, 'id' | 'nome'>;
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
  performancePorArea?: { area: string; media: number | null }[];
  heatmapData?: HeatmapKPI[];
  alertasQuedaConsecutiva?: AlertaQuedaItem[];
}

export interface HeatmapKPI {
  kpiId: string;
  kpiNome: string;
  cells: { mes: number; ano: number; label: string; status: string | null; percentual: number | null }[];
}

export interface AlertaQuedaItem {
  kpiId: string;
  nome: string;
  categoria: Categoria;
  valores: (number | null)[];
  meses: { mes: number; ano: number }[];
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
