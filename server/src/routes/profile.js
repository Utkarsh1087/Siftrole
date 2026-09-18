const express = require('express');
const { getUserProfile, updateUserProfile, getUserById } = require('../store');

const router = express.Router();

// GET candidate profile
router.get('/', (req, res) => {
  const userId = req.user?.id || req.query?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const profile = getUserProfile(userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  return res.json({ profile });
});

// GET candidate profile by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  const profile = getUserProfile(userId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found.' });
  }

  return res.json({ profile });
});

// PUT candidate profile update
router.put('/', (req, res) => {
  const userId = req.user?.id || req.body?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const updated = updateUserProfile(userId, req.body || {});
  if (!updated) {
    return res.status(404).json({ error: 'Failed to update profile or user not found.' });
  }

  return res.json({ success: true, profile: updated });
});

// PUT candidate profile by ID
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const updated = updateUserProfile(userId, req.body || {});
  if (!updated) {
    return res.status(404).json({ error: 'Failed to update profile or user not found.' });
  }

  return res.json({ success: true, profile: updated });
});

module.exports = router;
