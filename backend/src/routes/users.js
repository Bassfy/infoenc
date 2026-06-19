const express = require('express');
const router = express.Router();

// GET /api/users (admin)
router.get('/', (req, res) => {
  res.json({ success: true, data: [], pagination: { page: 1, perPage: 25, total: 0, totalPages: 0 } });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  res.json({ success: true, data: null });
});

// PUT /api/users/:id/role (admin)
router.put('/:id/role', (req, res) => {
  res.json({ success: true, message: 'User role updated' });
});

// DELETE /api/users/:id (admin)
router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'User deleted' });
});

module.exports = router;
