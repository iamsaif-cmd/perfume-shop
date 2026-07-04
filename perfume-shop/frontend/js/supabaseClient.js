// Fill these in with your Supabase project's public values (safe for frontend).
// Find them in Supabase Dashboard > Settings > API.
const SUPABASE_URL = "https://yuwxjvshokiexwhcqwqm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Szap6ZWEGiMyE1SINykazQ_4ssYxEFs";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Backend API base — change if you deploy the backend elsewhere
const API_BASE = "http://localhost:5000/api";
