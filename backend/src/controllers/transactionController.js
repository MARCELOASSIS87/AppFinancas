const prisma = require('../lib/prisma');

async function create(req, res) {
  const { date, description, amount, categoryId, recorrente, status } = req.body;
  const transaction = await prisma.transaction.create({
    data: {
      user: { connect: { id: Number(req.userId) } },
      date: new Date(date),
      description,
      amount,
      recorrente,
      status,
      category: { connect: { id: Number(categoryId) } },
    },
    include: { category: true },
  });
  return res.status(201).json(transaction);
}

async function list(req, res) {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: { category: true },
  });
  return res.json(transactions);
}

async function update(req, res) {
  const { id } = req.params;
  const existing = await prisma.transaction.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) return res.status(404).json({ error: 'Transação não encontrada' });
  const { date, description, amount, categoryId, recorrente, status } = req.body;
  const transaction = await prisma.transaction.update({
    where: { id: Number(id) },
    data: {
      ...(date && { date: new Date(date) }),
      ...(description !== undefined && { description }),
      ...(amount !== undefined && { amount }),
      ...(recorrente !== undefined && { recorrente }),
      ...(status !== undefined && { status }),
      ...(categoryId !== undefined && { category: { connect: { id: Number(categoryId) } } }),
    },
    include: { category: true },
  });
  return res.json(transaction);
}

async function remove(req, res) {
  const { id } = req.params;
  const existing = await prisma.transaction.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) return res.status(404).json({ error: 'Transação não encontrada' });
  await prisma.transaction.delete({ where: { id: Number(id) } });
  return res.status(204).send();
}

module.exports = { create, list, update, remove };
