const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? 'presente' : 'ausente');
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token válido, userId:', decoded.id);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log('Token inválido:', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
