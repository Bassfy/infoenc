const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

const coupons = [
  { code: 'WELCOME15', type: 'percentage', value: 15, minOrderAmount: 200, isActive: true, usedCount: 42, maxUses: 500 },
  { code: 'ARCH50', type: 'fixed', value: 50, minOrderAmount: 500, isActive: true, usedCount: 18, maxUses: 100 },
  { code: 'PROF20', type: 'percentage', value: 20, minOrderAmount: 1000, isActive: true, usedCount: 7, maxUses: 50 },
];

// Validate coupon code
router.post('/validate', [
  body('code').notEmpty().isString().trim().toUpperCase(),
  body('orderAmount').isFloat({ min: 0 }),
], validate, (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = coupons.find((c) => c.code === code.toUpperCase() && c.isActive);

  if (!coupon) {
    return res.status(404).json({ success: false, error: 'Invalid coupon code' });
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ success: false, error: 'Coupon has reached its usage limit' });
  }
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      error: `Minimum order amount of $${coupon.minOrderAmount} required`,
    });
  }

  const discount = coupon.type === 'percentage'
    ? (orderAmount * coupon.value) / 100
    : coupon.value;

  res.json({
    success: true,
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: parseFloat(discount.toFixed(2)),
    },
  });
});

// Admin: list coupons
router.get('/', (req, res) => {
  res.json({ success: true, data: coupons });
});

// Admin: create coupon
router.post('/', [
  body('code').notEmpty().isString().trim().toUpperCase(),
  body('type').isIn(['percentage', 'fixed']),
  body('value').isFloat({ min: 0 }),
], validate, (req, res) => {
  const existing = coupons.find((c) => c.code === req.body.code.toUpperCase());
  if (existing) return res.status(409).json({ error: 'Coupon code already exists' });
  const coupon = { ...req.body, usedCount: 0, isActive: true };
  coupons.push(coupon);
  res.status(201).json({ success: true, data: coupon });
});

module.exports = router;
