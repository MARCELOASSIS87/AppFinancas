const prisma = require('../lib/prisma');

async function create(req, res) {
  const { date, description, categoryId, amount, status, paymentMethodId, notes } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      user: { connect: { id: Number(req.userId) } },
      date: new Date(date),
      description,
      amount,
      status,
      category: { connect: { id: Number(categoryId) } },
      paymentMethod: paymentMethodId ? { connect: { id: Number(paymentMethodId) } } : undefined,
      notes: notes || null,
    },
    include: { category: true, paymentMethod: true },
  });

  return res.status(201).json(transaction);
}

async function list(req, res) {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
    include: { category: true, paymentMethod: true },
  });

  return res.json(transactions);
}

async function update(req, res) {
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({
    where: { id: Number(id), userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: 'Transação não encontrada' });

  const { date, description, categoryId, amount, status, paymentMethodId, notes } = req.body;

  const transaction = await prisma.transaction.update({
    where: { id: Number(id) },
    data: {
      ...(date && { date: new Date(date) }),
      ...(description !== undefined && { description }),
      ...(categoryId !== undefined && { category: { connect: { id: Number(categoryId) } } }),
      ...(amount !== undefined && { amount }),
      ...(status !== undefined && { status }),
      ...(paymentMethodId !== undefined && {
        paymentMethod: paymentMethodId
          ? { connect: { id: Number(paymentMethodId) } }
          : { disconnect: true },
      }),
      ...(notes !== undefined && { notes: notes || null }),
    },
    include: { category: true, paymentMethod: true },
  });

  return res.json(transaction);
}

async function remove(req, res) {
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({
    where: { id: Number(id), userId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: 'Transação não encontrada' });

  await prisma.transaction.delete({ where: { id: Number(id) } });

  return res.status(204).send();
}

module.exports = { create, list, update, remove };
