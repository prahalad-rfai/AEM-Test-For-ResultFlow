import { createOptimizedPicture } from '../../scripts/aem.js';
import { pushEvent } from '../../scripts/datalayer.js';

function buildSidebar(products) {
  const sizes = new Set();
  products.forEach((p) => p.sizes.forEach((s) => sizes.add(s)));

  const sidebar = document.createElement('aside');
  sidebar.className = 'product-grid-sidebar';

  // Mobile toggle
  const toggle = document.createElement('button');
  toggle.className = 'product-grid-filter-toggle';
  toggle.textContent = 'Filter & Sort';
  toggle.setAttribute('aria-expanded', 'false');
  sidebar.append(toggle);

  const panel = document.createElement('div');
  panel.className = 'product-grid-filter-panel';

  // Size filter
  const sizeSection = document.createElement('div');
  sizeSection.className = 'product-grid-filter-section';
  const sizeHeading = document.createElement('h4');
  sizeHeading.textContent = 'Size';
  const sizeOptions = document.createElement('div');
  sizeOptions.className = 'product-grid-size-options';
  [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b)).forEach((size) => {
    const btn = document.createElement('button');
    btn.className = 'product-grid-size-btn';
    btn.textContent = size;
    btn.dataset.size = size;
    sizeOptions.append(btn);
  });
  sizeSection.append(sizeHeading, sizeOptions);

  // Price filter
  const priceSection = document.createElement('div');
  priceSection.className = 'product-grid-filter-section';
  const priceHeading = document.createElement('h4');
  priceHeading.textContent = 'Price';
  const priceOptions = document.createElement('div');
  priceOptions.className = 'product-grid-price-options';
  const priceRanges = [
    { label: 'Under $100', min: 0, max: 100 },
    { label: '$100 – $150', min: 100, max: 150 },
    { label: '$150 – $200', min: 150, max: 200 },
    { label: 'Over $200', min: 200, max: Infinity },
  ];
  priceRanges.forEach((range) => {
    const btn = document.createElement('button');
    btn.className = 'product-grid-price-btn';
    btn.textContent = range.label;
    btn.dataset.min = range.min;
    btn.dataset.max = range.max;
    priceOptions.append(btn);
  });
  priceSection.append(priceHeading, priceOptions);

  panel.append(sizeSection, priceSection);
  sidebar.append(panel);

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.classList.toggle('open', !expanded);
  });

  return sidebar;
}

function buildCard(product) {
  const li = document.createElement('li');
  li.className = 'product-grid-card';
  li.dataset.sizes = product.sizes.join(',');
  li.dataset.price = product.price;
  li.dataset.name = product.name;

  const link = document.createElement('a');
  link.href = product.href;
  link.className = 'product-grid-card-link';
  link.setAttribute('aria-label', product.name);

  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'product-grid-card-image';
  const pic = createOptimizedPicture(product.image, product.alt, false, [{ width: '600' }]);
  imgWrapper.append(pic);

  const body = document.createElement('div');
  body.className = 'product-grid-card-body';

  const name = document.createElement('h3');
  name.textContent = product.name;

  const desc = document.createElement('p');
  desc.className = 'product-grid-card-desc';
  desc.textContent = product.description;

  const price = document.createElement('p');
  price.className = 'product-grid-card-price';
  price.textContent = product.priceLabel;

  body.append(name, desc, price);
  link.append(imgWrapper, body);
  li.append(link);
  return li;
}

export default function decorate(block) {
  const rows = [...block.children];
  const products = rows.map((row) => {
    const [imgCell, detailsCell] = row.children;
    const img = imgCell?.querySelector('img');
    const name = detailsCell?.querySelector('h3')?.textContent.trim() || '';
    const paras = [...(detailsCell?.querySelectorAll('p') || [])];
    const description = paras[0]?.textContent.trim() || '';
    const priceLabel = paras[1]?.textContent.trim() || '';
    const price = parseFloat(priceLabel.replace(/[^0-9.]/g, '')) || 0;
    const sizes = [...(detailsCell?.querySelectorAll('li') || [])].map((li) => li.textContent.trim());
    const href = detailsCell?.querySelector('a')?.getAttribute('href') || '#';
    return {
      image: img?.src || '', alt: img?.alt || name, name, description, priceLabel, price, sizes, href,
    };
  });

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'product-grid-toolbar';

  const countEl = document.createElement('p');
  countEl.className = 'product-grid-count';
  countEl.textContent = `${products.length} products`;

  const sortLabel = document.createElement('label');
  sortLabel.htmlFor = 'product-grid-sort';
  sortLabel.textContent = 'Sort by';
  sortLabel.className = 'product-grid-sort-label';

  const sortEl = document.createElement('select');
  sortEl.id = 'product-grid-sort';
  sortEl.className = 'product-grid-sort';
  sortEl.innerHTML = `
    <option value="featured">Featured</option>
    <option value="price-asc">Price: Low to High</option>
    <option value="price-desc">Price: High to Low</option>
    <option value="name-asc">Name: A–Z</option>
  `;

  toolbar.append(countEl, sortLabel, sortEl);

  // Grid
  const ul = document.createElement('ul');
  ul.className = 'product-grid-list';
  products.forEach((p) => ul.append(buildCard(p)));

  // Layout
  const sidebar = buildSidebar(products);

  const main = document.createElement('div');
  main.className = 'product-grid-main';
  main.append(toolbar, ul);

  const layout = document.createElement('div');
  layout.className = 'product-grid-layout';
  layout.append(sidebar, main);

  block.replaceChildren(layout);

  pushEvent({
    event: 'product_list_view',
    list: {
      name: document.title,
      items: products.map((p) => ({ id: p.href, name: p.name, price: p.price })),
    },
  });

  // Filter state
  const activeFilters = { sizes: new Set(), priceMin: null, priceMax: null };

  function applyFilters() {
    const sortVal = sortEl.value;
    const cards = [...ul.children];

    cards.forEach((card) => {
      const cardSizes = card.dataset.sizes.split(',');
      const cardPrice = parseFloat(card.dataset.price);
      const sizeMatch = activeFilters.sizes.size === 0
        || [...activeFilters.sizes].some((s) => cardSizes.includes(s));
      const priceMatch = activeFilters.priceMin === null
        || (cardPrice >= activeFilters.priceMin && cardPrice < activeFilters.priceMax);
      card.hidden = !(sizeMatch && priceMatch);
    });

    const visible = cards.filter((c) => !c.hidden);
    visible.sort((a, b) => {
      if (sortVal === 'price-asc') return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
      if (sortVal === 'price-desc') return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
      if (sortVal === 'name-asc') return a.dataset.name.localeCompare(b.dataset.name);
      return 0;
    });
    visible.forEach((card) => ul.append(card));

    countEl.textContent = `${visible.length} product${visible.length !== 1 ? 's' : ''}`;
  }

  sidebar.querySelectorAll('.product-grid-size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) activeFilters.sizes.add(btn.dataset.size);
      else activeFilters.sizes.delete(btn.dataset.size);
      pushEvent({
        event: 'filter_applied',
        filter: { type: 'size', value: btn.dataset.size, active: btn.classList.contains('active') },
      });
      applyFilters();
    });
  });

  sidebar.querySelectorAll('.product-grid-price-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      sidebar.querySelectorAll('.product-grid-price-btn').forEach((b) => b.classList.remove('active'));
      if (!wasActive) {
        btn.classList.add('active');
        activeFilters.priceMin = parseFloat(btn.dataset.min);
        activeFilters.priceMax = parseFloat(btn.dataset.max);
        pushEvent({
          event: 'filter_applied',
          filter: {
            type: 'price', min: activeFilters.priceMin, max: activeFilters.priceMax, label: btn.textContent,
          },
        });
      } else {
        activeFilters.priceMin = null;
        activeFilters.priceMax = null;
        pushEvent({
          event: 'filter_applied',
          filter: {
            type: 'price', min: null, max: null, label: null,
          },
        });
      }
      applyFilters();
    });
  });

  sortEl.addEventListener('change', () => {
    pushEvent({ event: 'sort_changed', sort: sortEl.value });
    applyFilters();
  });
}
