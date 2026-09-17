const express = require('express');
const { getAllListings, listRecruiterSubmissions, getListingById, updateListingStatus } = require('../store');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
}

router.get('/listings', requireAdmin, (req, res) => {
  res.json({ listings: getAllListings() });
});

router.post('/listings/:id/approve', requireAdmin, (req, res) => {
  const target = getListingById(req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  const updatedListing = updateListingStatus(target.id, 'active');
  return res.json({ listing: updatedListing });
});

router.get('/recruiter-submissions', requireAdmin, (req, res) => {
  res.json({ submissions: listRecruiterSubmissions() });
});

module.exports = router;
