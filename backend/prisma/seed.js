require("dotenv").config();
const { PrismaClient } = require("../node_modules/@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const dbUrl = new URL(process.env.DATABASE_URL.replace('mysql://', 'mariadb://'));

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
  connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const despesas = [
    'Mercado',
    'Alimentação fora',
    'Carro',
    'Transporte app',
    'Moradia',
    'Saúde',
    'Cuidados pessoais',
    'Vestuário',
    'Lazer/Presentes',
    'Dívidas',
    'Serviços',
    'Investimento',
  ];

  for (const name of despesas) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, type: 'despesa', isDefault: true },
    });
  }

  const receitas = [
    'Salário',
    'Renda',
    'Vale',
    'Outros',
  ];

  for (const name of receitas) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, type: 'receita', isDefault: true },
    });
  }

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
