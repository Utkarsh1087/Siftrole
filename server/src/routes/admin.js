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

// Admin-triggered scraper run on demand
router.post('/scrape/trigger', requireAdmin, async (req, res) => {
  try {
    const { triggerAdminScraper } = require('../scraperCron');
    const outcome = await triggerAdminScraper();
    return res.json({ success: true, ...outcome });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Admin scraper status
router.get('/scrape/status', requireAdmin, (req, res) => {
  const { getScraperStatus } = require('../scraperCron');
  return res.json({ success: true, ...getScraperStatus() });
});

module.exports = router;
