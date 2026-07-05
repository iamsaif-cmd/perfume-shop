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

  if (!session) {
    const guestCount = getGuestCart().reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = guestCount;
    badge.style.display = guestCount > 0 ? 'inline-flex' : 'none';
    return;
  }

  try {
    const items = await apiFetch('/cart');
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  } catch {
    badge.style.display = 'none';
  }
}

// Closes the mobile dropdown menu whenever a nav link is tapped
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  if (!navToggle) return;
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => { navToggle.checked = false; });
  });
});

// Shows/hides nav links depending on auth + admin state
async function renderAuthNav() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const authLink = document.getElementById('navAuthLink');
  const adminLink = document.getElementById('navAdminLink');
  const ordersLink = document.getElementById('navOrdersLink');
  if (!authLink) return;

  if (ordersLink) ordersLink.style.display = session ? 'inline' : 'none';

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

    await mergeGuestCartIntoAccount();
  } else {
    authLink.textContent = 'Login';
    authLink.href = 'login.html';
    if (adminLink) adminLink.style.display = 'none';
  }

  refreshCartBadge();
}

// ============ TOAST NOTIFICATIONS ============
// Replaces jarring alert() popups with small glass pills that fade in/out.
function ensureToastStack() {
  let stack = document.getElementById('toastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    document.body.appendChild(stack);
  }
  return stack;
}
function showToast(message, type = 'default', duration = 3000) {
  const stack = ensureToastStack();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ============ GUEST CART (localStorage) ============
// Real stores let people add to cart before creating an account — we mirror
// that here, then silently merge the guest cart into their real cart the
// moment they log in. Login is only required at checkout, not at "Add to Cart".
const GUEST_CART_KEY = 'essence_guest_cart';

function getGuestCart() {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || []; }
  catch { return []; }
}
function setGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}
function guestAddToCart(productId, quantity = 1) {
  const cart = getGuestCart();
  const existing = cart.find(i => i.product_id === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ product_id: productId, quantity });
  setGuestCart(cart);
}
function guestUpdateQty(productId, quantity) {
  let cart = getGuestCart();
  if (quantity < 1) {
    cart = cart.filter(i => i.product_id !== productId);
  } else {
    const item = cart.find(i => i.product_id === productId);
    if (item) item.quantity = quantity;
  }
  setGuestCart(cart);
}
function guestRemoveItem(productId) {
  setGuestCart(getGuestCart().filter(i => i.product_id !== productId));
}

// Pushes every locally-stored guest cart item into the real DB cart.
// Called right after a successful login. Silently skips items that fail
// (e.g. a product that went out of stock in the meantime).
async function mergeGuestCartIntoAccount() {
  const guestItems = getGuestCart();
  if (!guestItems.length) return;
  for (const item of guestItems) {
    try {
      await apiFetch('/cart', { method: 'POST', body: JSON.stringify({ product_id: item.product_id, quantity: item.quantity }) });
    } catch { /* skip silently — item may be gone or out of stock */ }
  }
  setGuestCart([]);
}

// ============ WISHLIST (localStorage) ============
const WISHLIST_KEY = 'essence_wishlist';
function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
  catch { return []; }
}
function isWishlisted(productId) {
  return getWishlist().includes(productId);
}
function toggleWishlist(productId) {
  let list = getWishlist();
  if (list.includes(productId)) {
    list = list.filter(id => id !== productId);
  } else {
    list.push(productId);
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return list.includes(productId);
}

// ============ RECENTLY VIEWED (localStorage) ============
const RECENT_KEY = 'essence_recently_viewed';
function trackRecentlyViewed(productId) {
  let list = getRecentlyViewed().filter(id => id !== productId);
  list.unshift(productId);
  list = list.slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}
function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
  catch { return []; }
}

// ============ BACK TO TOP ============
function initBackToTop() {
  if (document.getElementById('backToTop')) return;
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
}
document.addEventListener('DOMContentLoaded', initBackToTop);

// ============ CUSTOM CONFIRM MODAL ============
// Replaces the native confirm() popup with a glassy on-brand dialog.
// Usage: const ok = await confirmModal('Delete this fragrance?'); if (ok) { ... }
function confirmModal(message, confirmLabel = 'Delete', cancelLabel = 'Cancel') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>Are you sure?</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button class="btn-outline" data-action="cancel">${cancelLabel}</button>
          <button class="btn-gold" data-action="confirm">${confirmLabel}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    function close(result) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
      resolve(result);
    }
    overlay.querySelector('[data-action="confirm"]').onclick = () => close(true);
    overlay.querySelector('[data-action="cancel"]').onclick = () => close(false);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
  });
}

document.addEventListener('DOMContentLoaded', renderAuthNav);

// Elastic scroll-reveal — applies to any .reveal element present at load time.
// Dynamically-injected content (like product cards) triggers its own reveal separately.
document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal:not(.show)').forEach(el => io.observe(el));
});
