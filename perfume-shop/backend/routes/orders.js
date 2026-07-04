const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabaseClient');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// POST /api/orders/checkout — turns the user's cart into an order
router.post('/checkout', async (req, res) => {
  const userId = req.user.id;

  const { data: cartItems, error: cartError } = await supabaseAdmin
    .from('cart_items')
    .select('quantity, product:products(id, price, stock, name)')
    .eq('user_id', userId);

  if (cartError) return res.status(500).json({ error: cartError.message });
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert([{ user_id: userId, total, status: 'placed' }])
    .select()
    .single();

  if (orderError) return res.status(500).json({ error: orderError.message });

  const orderItemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemsPayload);
  if (itemsError) return res.status(500).json({ error: itemsError.message });

  // Reduce stock for each product ordered
  for (const item of cartItems) {
    await supabaseAdmin
      .from('products')
      .update({ stock: Math.max(0, item.product.stock - item.quantity) })
      .eq('id', item.product.id);
  }

  // Clear the cart
  await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);

  res.status(201).json({ order, message: 'Order placed successfully' });
});

// GET /api/orders — order history for the logged-in user
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, product:products(name, image_url))')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
