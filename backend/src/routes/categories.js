const express = require('express');
const router = express.Router();

const categories = [
  { id: 'recessed', label: 'Recessed Profiles', description: 'Seamless flush integration', count: 24, featured: true },
  { id: 'surface-mounted', label: 'Surface Mounted', description: 'Direct surface application', count: 18, featured: true },
  { id: 'corner', label: 'Corner Profiles', description: 'Precision corner solutions', count: 12, featured: true },
  { id: 'suspended', label: 'Suspended Profiles', description: 'Pendant installations', count: 9, featured: true },
  { id: 'trimless', label: 'Trimless Profiles', description: 'Invisible integration', count: 8, featured: true },
  { id: 'flexible', label: 'Flexible Profiles', description: 'Curved applications', count: 6, featured: false },
  { id: 'led-strips', label: 'LED Strips', description: 'Premium SMD strips', count: 32, featured: true },
  { id: 'cob-strips', label: 'COB LED Strips', description: 'Continuous filament light', count: 14, featured: true },
  { id: 'drivers', label: 'Drivers', description: 'Constant voltage/current', count: 20, featured: false },
  { id: 'controllers', label: 'Controllers', description: 'DALI, Bluetooth, KNX', count: 11, featured: false },
  { id: 'power-supplies', label: 'Power Supplies', description: 'Professional power', count: 16, featured: false },
  { id: 'diffusers', label: 'Diffusers', description: 'Clear, opal, frosted', count: 8, featured: false },
  { id: 'accessories', label: 'Accessories', description: 'Everything else', count: 45, featured: false },
  { id: 'connectors', label: 'Connectors', description: 'Strip to strip, strip to driver', count: 30, featured: false },
  { id: 'end-caps', label: 'End Caps', description: 'Precision aluminum caps', count: 15, featured: false },
  { id: 'mounting-clips', label: 'Mounting Clips', description: 'Tool-free spring clips', count: 12, featured: false },
];

router.get('/', (req, res) => {
  const { featured } = req.query;
  const data = featured === 'true' ? categories.filter((c) => c.featured) : categories;
  res.json({ success: true, data });
});

router.get('/:id', (req, res) => {
  const cat = categories.find((c) => c.id === req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true, data: cat });
});

module.exports = router;
