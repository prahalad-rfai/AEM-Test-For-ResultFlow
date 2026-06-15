import { pushEvent } from '../../scripts/datalayer.js';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('stepup-cart') || '[]');
  } catch {
    return [];
  }
}

function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

function buildOrderSummary(cart) {
  const summary = document.createElement('div');
  summary.className = 'checkout-summary';

  const heading = document.createElement('h2');
  heading.textContent = 'Order Summary';
  summary.append(heading);

  const ul = document.createElement('ul');
  ul.className = 'checkout-summary-items';
  cart.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'checkout-summary-item';
    li.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="56" height="56" loading="lazy">
      <div class="checkout-summary-item-details">
        <p>${item.name}</p>
        <p>Size ${item.size} &nbsp;·&nbsp; Qty ${item.quantity}</p>
      </div>
      <span>${formatPrice(item.price * item.quantity)}</span>
    `;
    ul.append(li);
  });
  summary.append(ul);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  const totals = document.createElement('div');
  totals.className = 'checkout-summary-totals';
  totals.innerHTML = `
    <div class="checkout-totals-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    <div class="checkout-totals-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
    <div class="checkout-totals-row checkout-totals-final"><span>Total</span><span>${formatPrice(total)}</span></div>
  `;
  summary.append(totals);

  return { summary, total };
}

export default function decorate(block) {
  block.innerHTML = '';

  const cart = getCart();
  if (cart.length === 0) {
    block.innerHTML = `
      <div class="checkout-empty">
        <p>Your cart is empty.</p>
        <a href="/collections/running" class="button primary">Continue Shopping</a>
      </div>
    `;
    return;
  }

  pushEvent({
    event: 'begin_checkout',
    cart: {
      items: cart.map((i) => ({
        id: i.id, name: i.name, price: i.price, quantity: i.quantity,
      })),
    },
  });

  const layout = document.createElement('div');
  layout.className = 'checkout-layout';

  // Form
  const form = document.createElement('form');
  form.className = 'checkout-form';
  form.noValidate = true;
  form.innerHTML = `
    <h2>Contact</h2>
    <div class="checkout-field">
      <label for="checkout-email">Email</label>
      <input type="email" id="checkout-email" name="email" placeholder="you@example.com" required autocomplete="email">
    </div>

    <h2>Shipping address</h2>
    <div class="checkout-field-row">
      <div class="checkout-field">
        <label for="checkout-first-name">First name</label>
        <input type="text" id="checkout-first-name" name="firstName" placeholder="Jane" required autocomplete="given-name">
      </div>
      <div class="checkout-field">
        <label for="checkout-last-name">Last name</label>
        <input type="text" id="checkout-last-name" name="lastName" placeholder="Doe" required autocomplete="family-name">
      </div>
    </div>
    <div class="checkout-field">
      <label for="checkout-address">Address</label>
      <input type="text" id="checkout-address" name="address" placeholder="123 Main St" required autocomplete="street-address">
    </div>
    <div class="checkout-field">
      <label for="checkout-address2">Apartment, suite, etc. (optional)</label>
      <input type="text" id="checkout-address2" name="address2" autocomplete="address-line2">
    </div>
    <div class="checkout-field-row">
      <div class="checkout-field">
        <label for="checkout-city">City</label>
        <input type="text" id="checkout-city" name="city" required autocomplete="address-level2">
      </div>
      <div class="checkout-field">
        <label for="checkout-state">State</label>
        <input type="text" id="checkout-state" name="state" placeholder="CA" required autocomplete="address-level1">
      </div>
      <div class="checkout-field">
        <label for="checkout-zip">ZIP code</label>
        <input type="text" id="checkout-zip" name="zip" placeholder="90210" required autocomplete="postal-code">
      </div>
    </div>

    <h2>Payment</h2>
    <div class="checkout-field">
      <label for="checkout-card">Card number</label>
      <input type="text" id="checkout-card" name="card" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="cc-number">
    </div>
    <div class="checkout-field-row">
      <div class="checkout-field">
        <label for="checkout-expiry">Expiry</label>
        <input type="text" id="checkout-expiry" name="expiry" placeholder="MM / YY" maxlength="7" autocomplete="cc-exp">
      </div>
      <div class="checkout-field">
        <label for="checkout-cvv">CVV</label>
        <input type="text" id="checkout-cvv" name="cvv" placeholder="123" maxlength="4" autocomplete="cc-csc">
      </div>
    </div>

    <p class="checkout-disclaimer">This is a demo store. No real charges will be made.</p>

    <button type="submit" class="button primary checkout-submit">Place Order</button>
  `;

  const { summary, total } = buildOrderSummary(cart);

  layout.append(form, summary);
  block.append(layout);

  function showFieldError(el, msg) {
    el.classList.add('checkout-field-error');
    let hint = el.parentElement.querySelector('.checkout-field-hint');
    if (!hint) {
      hint = document.createElement('span');
      hint.className = 'checkout-field-hint';
      el.after(hint);
    }
    hint.textContent = msg;
  }

  function clearFieldError(el) {
    el.classList.remove('checkout-field-error');
    el.parentElement.querySelector('.checkout-field-hint')?.remove();
  }

  // Clear errors on input
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
  });

  function validateForm() {
    const errors = [];
    const required = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zip'];
    required.forEach((name) => {
      const el = form.elements[name];
      if (el && !el.value.trim()) {
        showFieldError(el, 'This field is required');
        errors.push({ field: name, reason: 'required' });
      }
    });

    const emailEl = form.elements.email;
    if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      showFieldError(emailEl, 'Please enter a valid email address');
      errors.push({ field: 'email', reason: 'invalid_format' });
    }

    const cardEl = form.elements.card;
    if (cardEl && !cardEl.value.replace(/\s/g, '').match(/^\d{13,19}$/)) {
      showFieldError(cardEl, 'Please enter a valid card number');
      errors.push({ field: 'card', reason: 'invalid_format' });
    }

    const expiryEl = form.elements.expiry;
    if (expiryEl && !expiryEl.value.match(/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/)) {
      showFieldError(expiryEl, 'Use MM / YY format');
      errors.push({ field: 'expiry', reason: 'invalid_format' });
    }

    const cvvEl = form.elements.cvv;
    if (cvvEl && !cvvEl.value.match(/^\d{3,4}$/)) {
      showFieldError(cvvEl, 'Enter 3 or 4 digits');
      errors.push({ field: 'cvv', reason: 'invalid_format' });
    }

    return errors;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      pushEvent({
        event: 'form_error',
        form: { name: 'checkout', error_count: errors.length, errors },
      });
      form.querySelector('.checkout-field-error')?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));

    // Store order for confirmation page
    const order = {
      id: `SU-${Date.now()}`,
      items: cart,
      total,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      address: `${data.address}${data.address2 ? `, ${data.address2}` : ''}, ${data.city}, ${data.state} ${data.zip}`,
    };
    localStorage.setItem('stepup-last-order', JSON.stringify(order));
    localStorage.removeItem('stepup-cart');
    document.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart: [] } }));

    pushEvent({
      event: 'purchase',
      order: {
        id: order.id,
        total: order.total,
        items: order.items.map((i) => ({
          id: i.id, name: i.name, price: i.price, quantity: i.quantity,
        })),
      },
    });

    window.location.href = '/order-confirmation';
  });
}
