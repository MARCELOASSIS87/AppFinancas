const prisma = require('../lib/prisma');

const DRIVERS = ['Teinha', 'Arnaldo'];

// Regras de valor: nao_foi = 0, especial = 20, normal = 10 (manhã) ou 15 (tarde).
// Retorna null para combinação inválida.
function calcValue(type, period) {
  if (type === 'nao_foi') return 0;
  if (type === 'especial') return 20;
  if (type === 'normal') {
    if (period === 'manha') return 10;
    if (period === 'tarde') return 15;
  }
  return null;
}

// Só o dia importa numa corrida. Pega o YYYY-MM-DD da string e ignora hora/fuso:
// converter o timestamp inteiro faria o dia escorregar pelo lado errado da meia-noite
// UTC (21:30 de 25/08 em -03:00 vira 26/08). Tudo é gravado à meia-noite UTC, que é do
// que o dedupe por date+driver+period e os filtros de intervalo dependem.
function normalizeDate(value) {
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Valida o payload e devolve os dados prontos para o Prisma, ou uma mensagem de erro.
function parseBody({ date, driver, period, type, route }) {
  const parsedDate = normalizeDate(date);
  if (!parsedDate) return { error: 'Data inválida' };
  if (!DRIVERS.includes(driver)) return { error: 'Motorista inválido' };
  const value = calcValue(type, period);
  if (value === null) return { error: 'Tipo ou período inválido' };
  return {
    data: {
      date: parsedDate,
      driver,
      period,
      type,
      route: type === 'especial' ? route || null : null,
      value,
    },
  };
}

async function create(req, res) {
  const { data, error } = parseBody(req.body);
  if (error) return res.status(400).json({ error });

  const duplicate = await prisma.ride.findFirst({
    where: { date: data.date, driver: data.driver, period: data.period },
  });
  if (duplicate) {
    return res.status(409).json({ error: 'Já existe corrida para esse motorista, data e período' });
  }

  const ride = await prisma.ride.create({ data });
  return res.status(201).json(ride);
}

// Monta o filtro de datas a partir de ?start=&end= (ambos opcionais).
function dateFilter({ start, end }) {
  const from = start ? normalizeDate(start) : null;
  const to = end ? normalizeDate(end) : null;
  if (!from && !to) return {};
  return { date: { ...(from && { gte: from }), ...(to && { lte: to }) } };
}

async function list(req, res) {
  const rides = await prisma.ride.findMany({
    where: dateFilter(req.query),
    orderBy: [{ date: 'asc' }, { period: 'asc' }],
  });
  return res.json(rides);
}

async function weekSummary(req, res) {
  const grouped = await prisma.ride.groupBy({
    by: ['driver'],
    // ponytail: nao_foi não conta como corrida (e vale 0, então não muda o total).
    where: { ...dateFilter(req.query), type: { not: 'nao_foi' } },
    _sum: { value: true },
    _count: true,
  });

  const summary = Object.fromEntries(DRIVERS.map((d) => [d, { total: 0, rides: 0 }]));
  for (const row of grouped) {
    summary[row.driver] = { total: Number(row._sum.value ?? 0), rides: row._count };
  }
  return res.json(summary);
}

async function update(req, res) {
  const { id } = req.params;
  const existing = await prisma.ride.findUnique({ where: { id: Number(id) } });
  if (!existing) return res.status(404).json({ error: 'Corrida não encontrada' });

  const { data, error } = parseBody(req.body);
  if (error) return res.status(400).json({ error });

  const ride = await prisma.ride.update({ where: { id: Number(id) }, data });
  return res.json(ride);
}

async function remove(req, res) {
  const { id } = req.params;
  const existing = await prisma.ride.findUnique({ where: { id: Number(id) } });
  if (!existing) return res.status(404).json({ error: 'Corrida não encontrada' });

  await prisma.ride.delete({ where: { id: Number(id) } });
  return res.status(204).send();
}

module.exports = { create, list, weekSummary, update, remove, parseBody };
