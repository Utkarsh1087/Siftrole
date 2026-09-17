const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const adminRoutes = require('./routes/admin');
const { getUserById, listApplicationsByStudent, listNotificationsByStudent } = require('./store');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'siftrole-dev-secret';

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = getUserById(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user token.' });
    }
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/admin', authRequired, adminRoutes);

app.get('/api/profile', authRequired, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      grad_year: user.grad_year,
      degree: user.degree,
      resume_url: user.resume_url,
      profile_status: user.profile_status,
    },
    applications: listApplicationsByStudent(req.user.id),
  });
});

app.get('/api/notifications', authRequired, (req, res) => {
  return res.json({ notifications: listNotificationsByStudent(req.user.id) });
});

app.get('/api/roles', (req, res) => {
  res.json({ roles: ['student', 'recruiter', 'admin'] });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on ${port}`));
