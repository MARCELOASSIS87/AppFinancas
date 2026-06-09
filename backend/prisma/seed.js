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
  const categories = [
    'Alimentação', 'Transporte', 'Saúde', 'Moradia', 'Vestuário/Roupas',
    'Veículo/Combustível', 'Veículo/Seguro', 'Veículo/Financiamento', 'Veículo/GPS',
    'Telefonia/Internet', 'Energia', 'Água', 'Dividas', 'Compras',
    'Presentes/Lazer', 'Salário', 'Renda', 'Serviço recorrente', 'Serviços',
    'Hospedagem/Servidor', 'Cabelo', 'Saldo Inicial'
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, isDefault: true },
    });
  }

  const paymentMethods = [
    'Santander', 'Verocard', 'Alelo', 'Pix', 'Pix automático santander',
    'Cartão de Débito', 'Cartão de Crédito', 'Dinheiro', 'Ether.fi'
  ];

  for (const name of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
