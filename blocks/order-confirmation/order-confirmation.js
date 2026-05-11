function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}

export default function decorate(block) {
  block.innerHTML = '';

  let order;
  try {
    order = JSON.parse(localStorage.getItem('stepup-last-order') || 'null');
  } catch {
    order = null;
  }

  if (!order) {
    block.innerHTML = `
      <div class="order-confirmation-empty">
        <p>No recent order found.</p>
        <a href="/" class="button primary">Back to Home</a>
      </div>
    `;
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'order-confirmation-wrapper';

  const hero = document.createElement('div');
  hero.className = 'order-confirmation-hero';
  hero.innerHTML = `
    <div class="order-confirmation-icon" aria-hidden="true">✓</div>
    <h1>Order Confirmed!</h1>
    <p>Thanks, ${order.name.split(' ')[0]}! Your order <strong>${order.id}</strong> has been placed.</p>
    <p class="order-confirmation-email">A confirmation has been sent to <strong>${order.email}</strong></p>
  `;

  const details = document.createElement('div');
  details.className = 'order-confirmation-details';

  // Shipping info
  const shippingBox = document.createElement('div');
  shippingBox.className = 'order-confirmation-box';
  shippingBox.innerHTML = `
    <h3>Shipping to</h3>
    <p>${order.name}</p>
    <p>${order.address}</p>
    <p class="order-confirmation-delivery">Estimated delivery: 3–5 business days</p>
  `;

  // Order items
  const itemsBox = document.createElement('div');
  itemsBox.className = 'order-confirmation-box';

  const itemsHeading = document.createElement('h3');
  itemsHeading.textContent = 'Items ordered';
  itemsBox.append(itemsHeading);

  const ul = document.createElement('ul');
  ul.className = 'order-confirmation-items';
  order.items.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="60" height="60" loading="lazy">
      <div>
        <p>${item.name}</p>
        <p>Size ${item.size} &nbsp;·&nbsp; Qty ${item.quantity}</p>
      </div>
      <span>${formatPrice(item.price * item.quantity)}</span>
    `;
    ul.append(li);
  });
  itemsBox.append(ul);

  const totalRow = document.createElement('div');
  totalRow.className = 'order-confirmation-total';
  totalRow.innerHTML = `<span>Order total</span><span>${formatPrice(order.total)}</span>`;
  itemsBox.append(totalRow);

  details.append(shippingBox, itemsBox);

  const actions = document.createElement('div');
  actions.className = 'order-confirmation-actions';
  actions.innerHTML = `
    <a href="/" class="button primary">Continue Shopping</a>
  `;

  wrapper.append(hero, details, actions);
  block.append(wrapper);
}
