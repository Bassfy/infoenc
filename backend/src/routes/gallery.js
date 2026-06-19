const express = require('express');
const router = express.Router();

const projects = [
  {
    id: '1', slug: 'villa-minerva-amalfi', title: 'Villa Minerva', location: 'Amalfi Coast, Italy',
    category: 'residential', featured: true,
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85&auto=format&fit=crop',
    description: 'Complete architectural lighting overhaul for a 1,200m² private villa.',
    products: ['LUX Recessed 35 Slim', 'COB Elite 480', 'VOLT Driver 300W'],
    completedAt: '2024-01-15',
  },
  {
    id: '2', slug: 'axiom-tower-dubai', title: 'Axiom Tower', location: 'Dubai, UAE',
    category: 'commercial', featured: true,
    coverImage: 'https://images.unsplash.com/photo-1497366754035-f200586c6404?w=1200&q=85&auto=format&fit=crop',
    description: 'Grade-A commercial tower lobby and atrium lighting.',
    products: ['FLOAT Suspended 70', 'COB Elite 480', 'DALI Controller Pro'],
    completedAt: '2024-02-20',
  },
];

router.get('/', (req, res) => {
  const { category, featured, page = 1, perPage = 12 } = req.query;
  let data = [...projects];

  if (category) data = data.filter((p) => p.category === category);
  if (featured === 'true') data = data.filter((p) => p.featured);

  const total = data.length;
  const totalPages = Math.ceil(total / perPage);
  const paginated = data.slice((page - 1) * perPage, page * perPage);

  res.json({ success: true, data: paginated, pagination: { page, perPage, total, totalPages } });
});

router.get('/:slug', (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, data: project });
});

module.exports = router;
