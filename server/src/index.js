require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const adminRoutes = require('./routes/admin');
const newsletterRoutes = require('./routes/newsletter');
const profileRoutes = require('./routes/profile');
const { getUserById, listApplicationsByStudent, listNotificationsByStudent, getUserProfile } = require('./store');
const { generalApiLimiter, authLimiter } = require('./middleware/rateLimiter');

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

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
  }
  return next();
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Global bot protection and API rate limiter
app.use(generalApiLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'siftrole-server', uptime: process.uptime(), timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'siftrole-server', uptime: process.uptime(), timestamp: new Date().toISOString() }));

// Apply dedicated auth rate limiter to prevent brute force
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/listings', listingsRoutes);

// Strictly guard administrative routes with JWT authentication and admin role check
app.use('/api/admin', authRequired, adminOnly, adminRoutes);

app.use('/api/newsletter', newsletterRoutes);

// Candidate Profile management routes
app.use('/api/user/profile', profileRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/student-profile', authRequired, (req, res) => {
  const profile = getUserProfile(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    user: profile,
    applications: listApplicationsByStudent(req.user.id),
  });
});

app.get('/api/notifications', authRequired, (req, res) => {
  return res.json({ notifications: listNotificationsByStudent(req.user.id) });
});

app.get('/api/roles', (req, res) => {
  res.json({ roles: ['student', 'admin'] });
});

const { initScraperScheduler } = require('./scraperCron');

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
  initScraperScheduler();
});
