/**
 * Seed de PRODUÇÃO — cria apenas o usuário admin.
 * Nenhum KPI, departamento, ou dado de teste é criado.
 * O banco fica pronto para o usuário popular com dados reais.
 *
 * Uso: DATABASE_URL="..." npx ts-node -r tsconfig-paths/register prisma/seed-prod.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed de produção — criando usuário admin...');

  const existing = await prisma.user.findUnique({ where: { email: 'admin@fitbank.com' } });
  if (existing) {
    console.log('⚠️  Admin já existe — seed ignorado.');
    return;
  }

  const passwordHash = await bcrypt.hash('Felipe@2026', 12);
  await prisma.user.create({
    data: {
      nome: 'Felipe Thomazini',
      email: 'admin@fitbank.com',
      passwordHash,
      role: 'ADMIN',
      cargo: 'COO',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Usuário admin criado: admin@fitbank.com / Felipe@2026');
  console.log('🎉 Banco pronto para uso — zero dados de teste.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
