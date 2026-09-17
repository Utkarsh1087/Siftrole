const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser } = require('../store');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'siftrole-dev-secret';

function buildUserPayload(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'student' } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const createdUser = createUser({
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role,
    grad_year: null,
    degree: null,
    resume_url: null,
    profile_status: 'new',
  });

  const token = jwt.sign(buildUserPayload(createdUser), JWT_SECRET, { expiresIn: '12h' });
  return res.status(201).json({ token, user: buildUserPayload(createdUser) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign(buildUserPayload(user), JWT_SECRET, { expiresIn: '12h' });
  return res.json({ token, user: buildUserPayload(user) });
});

module.exports = router;
