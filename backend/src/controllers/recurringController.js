const prisma = require('../lib/prisma');

// Gera as datas mensais: uma por mês no dayOfMonth, a partir do mês de startDate,
// pelos 12 meses (boundary = startDate + 12 meses). Pula meses onde o dia não existe
// (ex.: dia 31 em fevereiro).
function generateMonthlyDates(startDate, dayOfMonth) {
  const startYear = startDate.getUTCFullYear();
  const startMonth = startDate.getUTCMonth();
  const dates = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = startMonth + i;
    const year = startYear + Math.floor(monthIndex / 12);
    const month = monthIndex % 12;
    const candidate = new Date(Date.UTC(year, month, dayOfMonth));
    // Se o dia "transbordou" para o mês seguinte, ele não existe neste mês: pula.
    if (candidate.getUTCMonth() !== month) continue;
    dates.push(candidate);
  }
  // Pula ocorrências anteriores ao startDate (ex.: dayOfMonth já passou no 1º mês).
  return dates.filter((d) => d >= startDate);
}

// Gera as datas semanais: começa na primeira ocorrência do dayOfWeek a partir de
// startDate (inclusive) e segue de 7 em 7 dias até endDate (exclusivo).
function generateWeeklyDates(startDate, dayOfWeek, endDate) {
  const cursor = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())
  );
  const diff = (dayOfWeek - cursor.getUTCDay() + 7) % 7;
  cursor.setUTCDate(cursor.getUTCDate() + diff);

  const dates = [];
  while (cursor < endDate) {
    if (cursor >= startDate) dates.push(new Date(cursor)); // só datas >= startDate
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return dates;
}

async function create(req, res) {
  const { description, amount, categoryId, frequency, dayOfMonth, dayOfWeek, startDate } = req.body;

  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0); // normaliza para meia-noite UTC
  const endDate = new Date(start);
  endDate.setUTCMonth(endDate.getUTCMonth() + 12);

  const template = await prisma.recurringTransaction.create({
    data: {
      user: { connect: { id: Number(req.userId) } },
      description,
      amount,
      frequency,
      dayOfMonth: dayOfMonth !== undefined && dayOfMonth !== null ? Number(dayOfMonth) : null,
      dayOfWeek: dayOfWeek !== undefined && dayOfWeek !== null ? Number(dayOfWeek) : null,
      startDate: start,
      endDate,
      category: { connect: { id: Number(categoryId) } },
    },
  });

  let dates = [];
  if (frequency === 'mensal') {
    dates = generateMonthlyDates(start, Number(dayOfMonth));
  } else if (frequency === 'semanal') {
    dates = generateWeeklyDates(start, Number(dayOfWeek), endDate);
  }

  for (const date of dates) {
    await prisma.transaction.create({
      data: {
        user: { connect: { id: Number(req.userId) } },
        date,
        description,
        amount,
        recorrente: 'fixo',
        status: 'pendente',
        category: { connect: { id: Number(categoryId) } },
        recurring: { connect: { id: template.id } },
      },
    });
  }

  return res.status(201).json({ ...template, occurrencesGenerated: dates.length });
}

async function list(req, res) {
  const recurring = await prisma.recurringTransaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
  return res.json(recurring);
}

async function remove(req, res) {
  const { id } = req.params;

  const existing = await prisma.recurringTransaction.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) return res.status(404).json({ error: 'Recorrência não encontrada' });

  // Apaga apenas as ocorrências futuras pendentes. As já pagas (ou de hoje) permanecem;
  // o recurringId delas vira NULL automaticamente ao apagar o template (ON DELETE SET NULL).
  await prisma.transaction.deleteMany({
    where: {
      recurringId: Number(id),
      status: 'pendente',
      date: { gt: new Date() },
    },
  });

  await prisma.recurringTransaction.delete({ where: { id: Number(id) } });

  return res.status(204).send();
}

module.exports = { create, list, remove };
