const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

// GET /api/orders (admin)
router.get('/', (req, res) => {
  const { page = 1, perPage = 25, status } = req.query;
  // Return mock orders list
  res.json({
    success: true,
    data: [],
    pagination: { page: 1, perPage: 25, total: 0, totalPages: 0 },
  });
});

// GET /api/orders/my (authenticated user)
router.get('/my', (req, res) => {
  res.json({ success: true, data: [] });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
  res.json({ success: true, data: null });
});

// POST /api/orders
router.post('/', [
  body('items').isArray({ min: 1 }),
  body('shippingAddress').isObject(),
  body('paymentMethod').isIn(['stripe', 'paypal', 'cod']),
], validate, (req, res) => {
  const orderNumber = `LPD-${Date.now().toString(36).toUpperCase()}`;
  const order = {
    id: Date.now().toString(),
    orderNumber,
    ...req.body,
    status: 'pending',
    paymentStatus: req.body.paymentMethod === 'cod' ? 'pending' : 'processing',
    createdAt: new Date().toISOString(),
  };
  res.status(201).json({ success: true, data: order });
});

// PATCH /api/orders/:id/status (admin)
router.patch('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
], validate, (req, res) => {
  res.json({ success: true, message: 'Order status updated' });
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', (req, res) => {
  res.json({ success: true, message: 'Order cancelled' });
});

module.exports = router;
