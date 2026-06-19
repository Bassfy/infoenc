const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');

// Mock data store (replace with Prisma/DB in production)
const products = require('../data/products');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// GET /api/products
router.get('/', [
  query('category').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('perPage').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['featured', 'newest', 'price-asc', 'price-desc', 'rating', 'bestselling']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('inStock').optional().isBoolean(),
  query('search').optional().isString().trim(),
], validate, (req, res) => {
  try {
    const {
      category,
      page = 1,
      perPage = 24,
      sort = 'featured',
      minPrice,
      maxPrice,
      inStock,
      search,
    } = req.query;

    let filtered = [...products];

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (minPrice) filtered = filtered.filter((p) => p.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= parseFloat(maxPrice));
    if (inStock === 'true') filtered = filtered.filter((p) => p.inStock);

    switch (sort) {
      case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'newest': filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'bestselling': filtered.sort((a, b) => b.salesCount - a.salesCount); break;
      default: filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / perPage);
    const pageInt = parseInt(page);
    const perPageInt = parseInt(perPage);
    const paginated = filtered.slice((pageInt - 1) * perPageInt, pageInt * perPageInt);

    res.json({
      success: true,
      data: paginated,
      pagination: { page: pageInt, perPage: perPageInt, total, totalPages },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/featured
router.get('/featured', (req, res) => {
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  res.json({ success: true, data: featured });
});

// GET /api/products/:slug
router.get('/:slug', [
  param('slug').isString().trim(),
], validate, (req, res) => {
  const product = products.find((p) => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// POST /api/products (admin only)
router.post('/', [
  body('name').notEmpty().isString().trim(),
  body('price').isFloat({ min: 0 }),
  body('category').notEmpty().isString(),
  body('description').notEmpty().isString(),
], validate, (req, res) => {
  // In production: authenticate admin, then save to DB
  const newProduct = {
    id: Date.now().toString(),
    slug: req.body.name.toLowerCase().replace(/\s+/g, '-'),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  res.status(201).json({ success: true, data: newProduct });
});

// PUT /api/products/:id (admin only)
router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Product updated' });
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = router;
