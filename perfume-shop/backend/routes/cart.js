const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabaseClient');
const { requireAuth } = require('../middleware/auth');

// All cart routes require login
router.use(requireAuth);

// GET /api/cart — returns cart items joined with product info
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .select('id, quantity, product:products(*)')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/cart  { product_id, quantity }
router.post('/', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  // Upsert: if item already in cart, bump quantity instead of duplicating
  const { data: existing } = await supabaseAdmin
    .from('cart_items')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('product_id', product_id)
    .maybeSingle();

  let result;
  if (existing) {
    result = await supabaseAdmin
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    result = await supabaseAdmin
      .from('cart_items')
      .insert([{ user_id: req.user.id, product_id, quantity }])
      .select()
      .single();
  }

  if (result.error) return res.status(500).json({ error: result.error.message });
  res.status(201).json(result.data);
});

// PUT /api/cart/:id  { quantity }
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  const { data, error } = await supabaseAdmin
    .from('cart_items')
    .update({ quantity })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/cart/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
