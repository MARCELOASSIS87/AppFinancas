require("dotenv").config();
const { PrismaClient } = require("../../node_modules/@prisma/client");
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

module.exports = prisma;
