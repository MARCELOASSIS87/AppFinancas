const prisma = require('../lib/prisma');

async function list(req, res) {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  return res.json(categories);
}

async function create(req, res) {
  const { name, type, isDefault } = req.body;

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return res.status(400).json({ error: 'Categoria já existe' });

  const category = await prisma.category.create({
    data: { name, type, isDefault: isDefault ?? false },
  });

  return res.status(201).json(category);
}

module.exports = { list, create };
