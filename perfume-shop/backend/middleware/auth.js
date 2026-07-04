const { supabaseAdmin } = require('../supabaseClient');

// Verifies the Supabase access token sent as: Authorization: Bearer <token>
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;
  next();
}

// Must be used AFTER requireAuth. Checks the profiles table for is_admin.
async function requireAdmin(req, res, next) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', req.user.id)
    .single();

  if (error || !data?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

module.exports = { requireAuth, requireAdmin };
