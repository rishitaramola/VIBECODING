/**
 * Armory AI - VibeCoding Challenge
 * Vanilla JS implementation ensuring strictly isolated DOM updates and context locking.
 */

// ─── CONFIGURATION MATRIX ──────────────────────────────────────────────────────
const TARIFF_MULTIPLIERS = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  INR: { rate: 83, symbol: '₹' }
};

const ANNUAL_DISCOUNT = 0.8; // 20% off

// Base prices are stored in USD Monthly
const PRICING_MATRIX = {
  starter: { base: 29 },
  pro: { base: 99 },
  ent: { base: 499 }
};

// ─── STATE ─────────────────────────────────────────────────────────────────────
const state = {
  billingCycle: 'monthly', // 'monthly' | 'annual'
  currency: 'USD',
  activeBentoIndex: 0
};

// ─── DOM ELEMENTS ──────────────────────────────────────────────────────────────
const toggleBtn = document.getElementById('billing-toggle-btn');
const currencySelect = document.getElementById('currency-select');
const bentoItems = document.querySelectorAll('.bento-item');

const priceNodes = {
  starter: { value: document.getElementById('price-starter'), symbol: document.getElementById('sym-starter') },
  pro: { value: document.getElementById('price-pro'), symbol: document.getElementById('sym-pro') },
  ent: { value: document.getElementById('price-ent'), symbol: document.getElementById('sym-ent') }
};

// ─── PRICING LOGIC (Feature 1) ─────────────────────────────────────────────────
function updatePricingDOM() {
  const { rate, symbol } = TARIFF_MULTIPLIERS[state.currency];
  const discount = state.billingCycle === 'annual' ? ANNUAL_DISCOUNT : 1;

  // Isolate updates strictly to target text nodes to prevent global layout thrashing
  Object.keys(PRICING_MATRIX).forEach(tier => {
    const baseUsd = PRICING_MATRIX[tier].base;
    const finalPrice = Math.floor(baseUsd * rate * discount);
    
    const node = priceNodes[tier];
    
    // WAAPI micro-interaction for text updates (150ms-200ms easing)
    node.value.animate([
      { opacity: 0, transform: 'translateY(-4px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });

    node.value.textContent = finalPrice;
    node.symbol.textContent = symbol;
  });
}

// Event Listeners for Pricing
toggleBtn.addEventListener('click', () => {
  state.billingCycle = state.billingCycle === 'monthly' ? 'annual' : 'monthly';
  toggleBtn.classList.toggle('active', state.billingCycle === 'annual');
  updatePricingDOM();
});

currencySelect.addEventListener('change', (e) => {
  state.currency = e.target.value;
  updatePricingDOM();
});


// ─── BENTO-TO-ACCORDION CONTEXT LOCK (Feature 2) ─────────────────────────────
function setActiveBento(index) {
  state.activeBentoIndex = index;
  bentoItems.forEach(item => {
    if (parseInt(item.dataset.index) === index) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Interaction handling
bentoItems.forEach(item => {
  // Desktop hover interaction
  item.addEventListener('mouseenter', () => {
    if (window.innerWidth > 900) {
      setActiveBento(parseInt(item.dataset.index));
    }
  });
  
  // Mobile click interaction
  item.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      setActiveBento(parseInt(item.dataset.index));
    }
  });
});

// Context Lock via ResizeObserver
// Ensures that if user crosses the 900px breakpoint, the active index is preserved
// and structurally reflows into the correct open accordion panel or active grid cell.
const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    // The CSS media queries automatically reflow the structure,
    // but applying the .active class to the current state.activeBentoIndex
    // guarantees the context lock constraint is met.
    setActiveBento(state.activeBentoIndex);
  }
});

resizeObserver.observe(document.body);

// ─── INITIALIZATION ────────────────────────────────────────────────────────────
function init() {
  updatePricingDOM();
  setActiveBento(0);
}

init();
