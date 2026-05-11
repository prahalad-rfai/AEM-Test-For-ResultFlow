function getCart() {
  return JSON.parse(localStorage.getItem('aem-cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('aem-cart', JSON.stringify(cart));
  document.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
}

function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.nav-cart-count').forEach((el) => {
    el.textContent = total;
  });
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id && i.size === item.size);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push({ ...item });
  }
  saveCart(cart);
  updateCartCount();
}

function buildGallery(images) {
  const gallery = document.createElement('div');
  gallery.className = 'product-gallery';

  const main = document.createElement('div');
  main.className = 'product-gallery-main';
  const mainImg = document.createElement('img');
  mainImg.src = images[0]?.src || '';
  mainImg.alt = images[0]?.alt || '';
  main.append(mainImg);

  const thumbs = document.createElement('div');
  thumbs.className = 'product-gallery-thumbs';
  images.forEach((img, i) => {
    const thumb = document.createElement('button');
    thumb.className = `product-thumb${i === 0 ? ' active' : ''}`;
    thumb.setAttribute('aria-label', `View image ${i + 1}`);
    const t = document.createElement('img');
    t.src = img.src;
    t.alt = img.alt;
    thumb.append(t);
    thumb.addEventListener('click', () => {
      mainImg.src = img.src;
      mainImg.alt = img.alt;
      thumbs.querySelectorAll('.product-thumb').forEach((b) => b.classList.remove('active'));
      thumb.classList.add('active');
    });
    thumbs.append(thumb);
  });

  gallery.append(thumbs, main);
  return gallery;
}

function buildSizeSelector(sizes) {
  const wrap = document.createElement('div');
  wrap.className = 'product-sizes';
  const label = document.createElement('p');
  label.className = 'product-sizes-label';
  label.textContent = 'Size';
  wrap.append(label);

  const grid = document.createElement('div');
  grid.className = 'product-sizes-grid';
  sizes.forEach((size, i) => {
    const btn = document.createElement('button');
    btn.className = `product-size-btn${i === 0 ? ' active' : ''}`;
    btn.textContent = size;
    btn.dataset.size = size;
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.product-size-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    grid.append(btn);
  });
  wrap.append(grid);
  return wrap;
}

function buildQtySelector() {
  const wrap = document.createElement('div');
  wrap.className = 'product-qty';
  const label = document.createElement('p');
  label.className = 'product-qty-label';
  label.textContent = 'Quantity';
  wrap.append(label);

  const ctrl = document.createElement('div');
  ctrl.className = 'product-qty-ctrl';
  const dec = document.createElement('button');
  dec.textContent = '−';
  dec.setAttribute('aria-label', 'Decrease quantity');
  const input = document.createElement('input');
  input.type = 'number';
  input.value = '1';
  input.min = '1';
  input.max = '99';
  input.setAttribute('aria-label', 'Quantity');
  const inc = document.createElement('button');
  inc.textContent = '+';
  inc.setAttribute('aria-label', 'Increase quantity');

  dec.addEventListener('click', () => {
    const v = parseInt(input.value, 10);
    if (v > 1) input.value = v - 1;
  });
  inc.addEventListener('click', () => {
    const v = parseInt(input.value, 10);
    if (v < 99) input.value = v + 1;
  });

  ctrl.append(dec, input, inc);
  wrap.append(ctrl);
  return wrap;
}

function buildCartNotification(name) {
  const note = document.createElement('div');
  note.className = 'product-cart-note';
  note.textContent = `"${name}" added to cart`;
  document.body.append(note);
  requestAnimationFrame(() => note.classList.add('visible'));
  setTimeout(() => {
    note.classList.remove('visible');
    setTimeout(() => note.remove(), 300);
  }, 2500);
}

export default function decorate(block) {
  // sync cart count whenever the header finishes loading
  document.addEventListener('cart-updated', updateCartCount);
  updateCartCount();
  const [imgCol, detailCol] = [...block.firstElementChild.children];

  // --- gallery ---
  const images = [...imgCol.querySelectorAll('img')].map((img) => ({
    src: img.src,
    alt: img.alt,
  }));
  if (!images.length) {
    // fallback placeholder colours
    ['#d4c5b0', '#b0c5d4', '#c5d4b0', '#d4b0c5'].forEach((color, i) => {
      images.push({ src: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="${encodeURIComponent(color)}"/></svg>`, alt: `Product image ${i + 1}` });
    });
  }
  const gallery = buildGallery(images);

  // --- details ---
  const details = document.createElement('div');
  details.className = 'product-details';

  const title = detailCol.querySelector('h1, h2, h3')?.textContent || 'Product';
  const titleEl = document.createElement('h1');
  titleEl.className = 'product-title';
  titleEl.textContent = title;

  // collect paragraphs — first one that looks like a price, rest are description
  const paras = [...detailCol.querySelectorAll('p')];
  let price = '$0.00';
  let priceIdx = -1;
  paras.forEach((p, i) => {
    if (/^\$[\d.,]+/.test(p.textContent.trim())) { price = p.textContent.trim(); priceIdx = i; }
  });
  const priceEl = document.createElement('p');
  priceEl.className = 'product-price';
  priceEl.textContent = price;

  // rating stars (static for demo)
  const rating = document.createElement('div');
  rating.className = 'product-rating';
  rating.innerHTML = '★★★★<span class="star-empty">★</span><span class="product-rating-count">42 reviews</span>';

  // description
  const desc = document.createElement('div');
  desc.className = 'product-description';
  paras.forEach((p, i) => {
    if (i !== priceIdx) desc.append(p.cloneNode(true));
  });

  // sizes from a list if present, else defaults
  const listItems = [...detailCol.querySelectorAll('li')].map((li) => li.textContent.trim());
  const sizes = listItems.length ? listItems : ['6', '7', '8', '9', '10', '11', '12'];
  const sizeSelector = buildSizeSelector(sizes);

  // qty
  const qtySelector = buildQtySelector();

  // buttons
  const btnRow = document.createElement('div');
  btnRow.className = 'product-btn-row';

  const addBtn = document.createElement('button');
  addBtn.className = 'button primary product-add-btn';
  addBtn.textContent = 'Add to Cart';

  const buyBtn = document.createElement('button');
  buyBtn.className = 'button secondary product-buy-btn';
  buyBtn.textContent = 'Buy it Now';

  addBtn.addEventListener('click', () => {
    const size = sizeSelector.querySelector('.product-size-btn.active')?.dataset.size || sizes[0];
    const qty = parseInt(qtySelector.querySelector('input').value, 10) || 1;
    addToCart({
      id: title.toLowerCase().replace(/\s+/g, '-'), name: title, price, size, qty,
    });
    buildCartNotification(title);
    // update header counter
    document.dispatchEvent(new CustomEvent('cart-updated'));
  });

  buyBtn.addEventListener('click', () => {
    addBtn.click();
  });

  btnRow.append(addBtn, buyBtn);

  // trust badges
  const trust = document.createElement('ul');
  trust.className = 'product-trust';
  ['Free shipping over $75', '30-day free returns', 'Secure checkout'].forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    trust.append(li);
  });

  details.append(titleEl, rating, priceEl, document.createElement('hr'), desc, sizeSelector, qtySelector, btnRow, trust);

  block.innerHTML = '';
  block.classList.add('product-layout');
  block.append(gallery, details);
}
