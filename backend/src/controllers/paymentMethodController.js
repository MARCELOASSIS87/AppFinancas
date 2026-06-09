const prisma = require('../lib/prisma');

async function list(req, res) {
  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: { name: 'asc' },
  });
  return res.json(paymentMethods);
}

async function create(req, res) {
  const { name } = req.body;

  const existing = await prisma.paymentMethod.findUnique({ where: { name } });
  if (existing) return res.status(400).json({ error: 'Método de pagamento já existe' });

  const paymentMethod = await prisma.paymentMethod.create({
    data: { name },
  });

  return res.status(201).json(paymentMethod);
}

module.exports = { list, create };
