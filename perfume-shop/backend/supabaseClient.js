const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Service role client — full DB access, used for admin writes (products) and
// for verifying user JWTs. NEVER expose the service role key to the frontend.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabaseAdmin };
