const express = require('express');
const jwt = require('jsonwebtoken');
const {
  getAllListings,
  getListingById,
  listApplicationsByStudent,
  createApplication,
  createNotification,
  listNotificationsByStudent,
  hasApplication,
  getUserById,
} = require('../store');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'siftrole-dev-secret';

function requireAuth(req, res, next) {
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
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

router.get('/', (req, res) => {
  const listings = getAllListings();
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const startIndex = (page - 1) * limit;
  const pageItems = listings.slice(startIndex, startIndex + limit);

  res.json({
    listings: pageItems,
    count: listings.length,
    page,
    limit,
  });
});

router.get('/:id', (req, res) => {
  const listing = getListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  return res.json({ listing });
});

router.post('/:id/apply', requireAuth, (req, res) => {
  const listing = getListingById(req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  if (hasApplication(req.user.id, req.params.id)) {
    return res.status(409).json({ error: 'Application already recorded.' });
  }

  const newApplication = createApplication({
    id: `app-${Date.now()}`,
    student_id: req.user.id,
    listing_id: req.params.id,
    status: 'applied',
  });

  createNotification({
    id: `n-${Date.now()}`,
    student_id: req.user.id,
    listing_id: req.params.id,
    channel: 'email',
  });

  return res.status(201).json({ application: newApplication });
});

module.exports = router;
