require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const recurringRoutes = require('./routes/recurring');

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // apps nativos, curl
    const permitidas = [
      /^http:\/\/localhost(:\d+)?$/,
      'https://webfinancas.locapocos.com.br',
    ];
    const ok = permitidas.some((p) =>
      p instanceof RegExp ? p.test(origin) : p === origin
    );
    return callback(null, ok);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recurring', recurringRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
