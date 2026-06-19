const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

router.get('/', [
  query('productId').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
], validate, (req, res) => {
  res.json({ success: true, data: [], pagination: { page: 1, perPage: 10, total: 0, totalPages: 0 } });
});

router.post('/', [
  body('productId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').notEmpty().isString().trim().isLength({ max: 100 }),
  body('body').notEmpty().isString().trim().isLength({ min: 20, max: 1000 }),
], validate, (req, res) => {
  const review = {
    id: Date.now().toString(),
    ...req.body,
    verified: false,
    helpful: 0,
    createdAt: new Date().toISOString(),
  };
  res.status(201).json({ success: true, data: review });
});

router.post('/:id/helpful', (req, res) => {
  res.json({ success: true, message: 'Marked as helpful' });
});

module.exports = router;
