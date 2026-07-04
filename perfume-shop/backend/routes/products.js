const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabaseClient');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/products?category=women&search=rose
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  let query = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });

  if (category && category !== 'all') query = query.eq('category', category);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Product not found' });
  res.json(data);
});

// POST /api/products  (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { name, brand, description, top_notes, heart_notes, base_notes, price, image_url, category, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([{ name, brand, description, top_notes, heart_notes, base_notes, price, image_url, category, stock }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/products/:id  (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/products/:id  (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabaseAdmin.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
