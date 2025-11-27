
// middleware/auth.js
const jsonwebtoken = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send({ message: 'Access denied' });

  try {
    const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
    req.user = verified; // e.g., { _id: 123 }
    next();
  } catch (err) {
    return res.status(401).send({ message: 'Invalid token' });
  }
}

module.exports = auth;
