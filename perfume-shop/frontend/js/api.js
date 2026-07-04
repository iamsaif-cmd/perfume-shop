// Wraps fetch() and automatically attaches the logged-in user's Supabase token.
async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabaseClient.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

function formatPrice(n) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

// Updates the little cart count badge in the navbar, if present
async function refreshCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { badge.style.display = 'none'; return; }
  try {
    const items = await apiFetch('/cart');
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  } catch {
    badge.style.display = 'none';
  }
}

// Shows/hides nav links depending on auth + admin state
async function renderAuthNav() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const authLink = document.getElementById('navAuthLink');
  const adminLink = document.getElementById('navAdminLink');
  if (!authLink) return;

  if (session) {
    authLink.textContent = 'Logout';
    authLink.href = '#';
    authLink.onclick = async (e) => {
      e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.href = 'index.html';
    };

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (adminLink) adminLink.style.display = profile?.is_admin ? 'inline' : 'none';
  } else {
    authLink.textContent = 'Login';
    authLink.href = 'login.html';
    if (adminLink) adminLink.style.display = 'none';
  }

  refreshCartBadge();
}

document.addEventListener('DOMContentLoaded', renderAuthNav);
