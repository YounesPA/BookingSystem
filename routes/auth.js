
// routes/auth.js
const express = require('express');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validations/validations');
const Users = require('../models/membersRepository');

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  // Validate input
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await Users.findOneByEmail(email);
    if (userExists) {
      return res.status(400).send({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user
    const savedUser = await Users.createUser({ username, email, password: hashedPassword });

    // Return user (omit password)
    const { password: _, ...safeUser } = savedUser;
    res.status(201).send(safeUser);
  } catch (err) {
    // Handle SQLite unique constraint errors nicely
    if (String(err.message).includes('UNIQUE constraint failed: users.email')) {
      return res.status(400).send({ message: 'User already exists' });
    }
    res.status(500).send({ message: 'Database error', detail: err.message });
  }
});


// POST /login
router.post('/login', async (req, res) => {
  // Validate input
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  try {
    // Find user
    const user = await Users.findOneByEmail(req.body.email);
    if (!user) {
      return res.status(400).send({ message: 'Username or password is incorrect' });
    }

    // Compare password
    const valid = await bcryptjs.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(400).send({ message: 'Username or password is incorrect' });
    }

    // Generate token
    const token = jsonwebtoken.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
      expiresIn: '7d',
    });

    // Send token in header and body
    res.header('auth-token', token).send({ 'auth-token': token });
  } catch (err) {
    res.status(500).send({ message: 'Database error', detail: err.message });
  }
});

module.exports = router;
