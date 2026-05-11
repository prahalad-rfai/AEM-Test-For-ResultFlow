function getCart() {
  try {
    return JSON.parse(localStorage.getItem('stepup-cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('stepup-cart', JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart } }));
}

function formatPrice(cents) {
  return `$${cents.toFixed(2)}`;
}

function buildEmptyState() {
  const empty = document.createElement('div');
  empty.className = 'cart-empty';
  empty.innerHTML = `
    <p>Your cart is empty.</p>
    <a href="/collections/running" class="button primary">Continue Shopping</a>
  `;
  return empty;
}

function buildLineItem(item, onUpdate) {
  const li = document.createElement('li');
  li.className = 'cart-item';
  li.dataset.id = item.id;
  li.dataset.size = item.size;

  const img = document.createElement('div');
  img.className = 'cart-item-image';
  img.innerHTML = `<img src="${item.image}" alt="${item.name}" width="100" height="100" loading="lazy">`;

  const details = document.createElement('div');
  details.className = 'cart-item-details';

  const name = document.createElement('p');
  name.className = 'cart-item-name';
  name.textContent = item.name;

  const meta = document.createElement('p');
  meta.className = 'cart-item-meta';
  meta.textContent = `Size: ${item.size}`;

  const price = document.createElement('p');
  price.className = 'cart-item-price';
  price.textContent = formatPrice(item.price);

  const controls = document.createElement('div');
  controls.className = 'cart-item-controls';

  const decBtn = document.createElement('button');
  decBtn.className = 'cart-qty-btn';
  decBtn.setAttribute('aria-label', 'Decrease quantity');
  decBtn.textContent = '−';

  const qtyEl = document.createElement('span');
  qtyEl.className = 'cart-item-qty';
  qtyEl.textContent = item.quantity;

  const incBtn = document.createElement('button');
  incBtn.className = 'cart-qty-btn';
  incBtn.setAttribute('aria-label', 'Increase quantity');
  incBtn.textContent = '+';

  const removeBtn = document.createElement('button');
  removeBtn.className = 'cart-remove-btn';
  removeBtn.textContent = 'Remove';

  decBtn.addEventListener('click', () => {
    if (item.quantity > 1) {
      item.quantity -= 1;
      onUpdate();
    }
  });

  incBtn.addEventListener('click', () => {
    item.quantity += 1;
    onUpdate();
  });

  removeBtn.addEventListener('click', () => {
    item.quantity = 0;
    onUpdate();
  });

  controls.append(decBtn, qtyEl, incBtn, removeBtn);
  details.append(name, meta, price, controls);
  li.append(img, details);
  return li;
}

export default function decorate(block) {
  block.innerHTML = '';

  function render() {
    block.innerHTML = '';
    const cart = getCart();

    if (cart.length === 0) {
      block.append(buildEmptyState());
      return;
    }

    const layout = document.createElement('div');
    layout.className = 'cart-layout';

    // Line items
    const itemsSection = document.createElement('div');
    itemsSection.className = 'cart-items-section';

    const heading = document.createElement('h2');
    heading.textContent = 'Your Cart';
    itemsSection.append(heading);

    const ul = document.createElement('ul');
    ul.className = 'cart-items';

    cart.forEach((item) => {
      const li = buildLineItem(item, () => {
        const updated = getCart();
        const idx = updated.findIndex((c) => c.id === item.id && c.size === item.size);
        if (idx !== -1) {
          if (item.quantity === 0) updated.splice(idx, 1);
          else updated[idx].quantity = item.quantity;
          saveCart(updated);
        }
        render();
      });
      ul.append(li);
    });

    itemsSection.append(ul);

    // Summary
    const summary = document.createElement('div');
    summary.className = 'cart-summary';

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 75 ? 0 : 9.99;
    const total = subtotal + shipping;

    summary.innerHTML = `
      <h2>Order Summary</h2>
      <div class="cart-summary-row">
        <span>Subtotal</span><span>${formatPrice(subtotal)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Shipping</span><span>${shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
      </div>
      ${shipping > 0 ? `<p class="cart-shipping-note">Add ${formatPrice(75 - subtotal)} more for free shipping</p>` : '<p class="cart-shipping-note cart-free-shipping">You qualify for free shipping!</p>'}
      <div class="cart-summary-row cart-summary-total">
        <span>Total</span><span>${formatPrice(total)}</span>
      </div>
      <a href="/checkout" class="button primary cart-checkout-btn">Proceed to Checkout</a>
      <a href="/collections/running" class="cart-continue-link">Continue Shopping</a>
    `;

    layout.append(itemsSection, summary);
    block.append(layout);
  }

  render();
}
