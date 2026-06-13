/* ==========================================================================
   Butter & Bloom — Cart System
   Persists to localStorage. Works across all pages.
   ========================================================================== */

const BB_Cart = (() => {
    const STORAGE_KEY = 'bb-cart';
    const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

    let items = [];
    try { items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { items = []; }

    // ── State helpers ──────────────────────────────────────────────────────
    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        _render();
        _updateBadge();
    };

    const getTotal = () => items.reduce((s, i) => s + i.price * i.qty, 0);
    const getCount = () => items.reduce((s, i) => s + i.qty, 0);

    // ── Public API ─────────────────────────────────────────────────────────
    const addItem = (id, name, price, qty = 1) => {
        const ex = items.find(i => i.id === id);
        if (ex) ex.qty += qty;
        else items.push({ id, name, price: Number(price), qty });
        save();
        openCart();
        if (window.showToast) window.showToast(`${name} added to cart`, '🛒');
    };

    const removeItem = (id) => {
        items = items.filter(i => i.id !== id);
        save();
    };

    const updateQty = (id, qty) => {
        const item = items.find(i => i.id === id);
        if (!item) return;
        if (qty <= 0) removeItem(id);
        else { item.qty = qty; save(); }
    };

    const clear = () => { items = []; save(); };

    const openCart = () => {
        document.getElementById('bb-cart-sidebar')?.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        document.getElementById('bb-cart-sidebar')?.classList.remove('open');
        document.body.style.overflow = '';
    };

    const checkout = () => {
        if (items.length === 0) {
            if (window.showToast) window.showToast('Your cart is empty!', '🧁');
            return;
        }
        const ref = `BB-${Math.floor(100000 + Math.random() * 900000)}`;
        const total = getTotal();
        const count = getCount();
        const html = `
            <div class="modal-body-success">
                <div class="success-icon" style="font-size:2.8rem">🎉</div>
                <h3 class="success-title">Order Placed!</h3>
                <p class="success-message">
                    Thank you! Our chef will personally contact you <strong>within an hour</strong> to confirm your order and arrange pickup or delivery.
                </p>
                <div style="background:var(--warm-beige);padding:18px 32px;border-radius:14px;margin:18px 0;text-align:center;border:1px solid rgba(197,168,128,0.3)">
                    <p style="font-size:0.72rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gold-dark);margin-bottom:6px">Order Reference</p>
                    <p style="font-family:var(--font-heading);font-size:1.8rem;font-weight:700;letter-spacing:0.1em;color:var(--text-dark)">${ref}</p>
                </div>
                <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:6px">${count} item${count > 1 ? 's' : ''} &nbsp;·&nbsp; Total: <strong>${fmt(total)}</strong></p>
                <p style="font-size:0.78rem;color:var(--gold-dark);font-style:italic;margin-bottom:22px">Keep this reference handy — our chef will call you shortly.</p>
                <button class="btn btn-primary btn-sm btn-full" onclick="BB_Cart.clear();document.getElementById('modal-close-btn').click()">Done</button>
            </div>`;
        closeCart();
        if (window.openModal) window.openModal(html);
    };

    // ── UI ─────────────────────────────────────────────────────────────────
    const _updateBadge = () => {
        const badge = document.getElementById('bb-cart-badge');
        if (!badge) return;
        const n = getCount();
        badge.textContent = n;
        badge.style.display = n > 0 ? 'flex' : 'none';
    };

    const _render = () => {
        const list = document.getElementById('bb-cart-items');
        const foot = document.getElementById('bb-cart-footer');
        if (!list || !foot) return;

        if (items.length === 0) {
            list.innerHTML = `
                <div class="bb-cart-empty">
                    <div style="font-size:2.4rem;margin-bottom:12px">🧁</div>
                    <p style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-dark);margin-bottom:4px">Your cart is empty</p>
                    <p style="font-size:0.82rem;color:var(--text-muted)">Add something delicious!</p>
                </div>`;
            foot.innerHTML = '';
            return;
        }

        list.innerHTML = items.map(item => `
            <div class="bb-cart-item">
                <div class="bb-cart-item-info">
                    <p class="bb-cart-item-name">${item.name}</p>
                    <p class="bb-cart-item-price">${fmt(item.price)}</p>
                </div>
                <div class="bb-cart-item-controls">
                    <button class="bb-qty-btn" onclick="BB_Cart.updateQty('${item.id}', ${item.qty - 1})">−</button>
                    <span class="bb-qty-val">${item.qty}</span>
                    <button class="bb-qty-btn" onclick="BB_Cart.updateQty('${item.id}', ${item.qty + 1})">+</button>
                    <button class="bb-remove-btn" onclick="BB_Cart.removeItem('${item.id}')" aria-label="Remove">✕</button>
                </div>
            </div>`).join('');

        foot.innerHTML = `
            <div class="bb-cart-total">
                <span>Total</span>
                <span>${fmt(getTotal())}</span>
            </div>
            <button class="btn btn-primary btn-full" style="margin-top:12px" onclick="BB_Cart.checkout()">Checkout</button>`;
    };

    // ── Init ───────────────────────────────────────────────────────────────
    const init = () => {
        // Inject cart button into header
        const headerActions = document.querySelector('.header-actions');
        if (headerActions && !document.getElementById('bb-cart-btn')) {
            const btn = document.createElement('button');
            btn.id = 'bb-cart-btn';
            btn.className = 'bb-cart-toggle';
            btn.setAttribute('aria-label', 'Open cart');
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span id="bb-cart-badge" style="display:none">0</span>`;
            btn.addEventListener('click', openCart);
            headerActions.insertBefore(btn, headerActions.firstChild);
        }

        // Inject cart sidebar
        if (!document.getElementById('bb-cart-sidebar')) {
            const el = document.createElement('div');
            el.id = 'bb-cart-sidebar';
            el.className = 'bb-cart-sidebar';
            el.innerHTML = `
                <div class="bb-cart-overlay" id="bb-cart-overlay"></div>
                <div class="bb-cart-panel">
                    <div class="bb-cart-header">
                        <h2 class="bb-cart-title">Your Cart</h2>
                        <button class="bb-cart-close" id="bb-cart-close" aria-label="Close cart">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                    <div class="bb-cart-items" id="bb-cart-items"></div>
                    <div class="bb-cart-footer" id="bb-cart-footer"></div>
                </div>`;
            document.body.appendChild(el);
            document.getElementById('bb-cart-overlay').addEventListener('click', closeCart);
            document.getElementById('bb-cart-close').addEventListener('click', closeCart);
        }

        _render();
        _updateBadge();
    };

    document.addEventListener('DOMContentLoaded', init);

    return { addItem, removeItem, updateQty, clear, checkout, openCart, closeCart };
})();
