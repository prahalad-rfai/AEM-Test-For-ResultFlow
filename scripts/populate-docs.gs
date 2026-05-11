// Run populateAllDocs() to fill in all AEM content documents.
// Requires: Google Docs API scope (granted automatically on first run).

var DOC_IDS = {
  nav:               '1vQKzBmAPcIn2zy6xg1PS_D4qFTnRfYBZOmY2d3f5ews',
  index:             '1i2j8eA6l5zE8FsB5tTB3gGPCPYUN2Ikw8sEMHDQCh3s',
  cart:              '1hHtVvf5rFRRyV_Kx_OXoPxWW6TBSEDpvIvvQM3npz_k',
  checkout:          '1m6Qlk8vbBSxEWgvYMU0fxCEoKvPOoRN9N59B0RbjQE4',
  orderConfirmation: '1ND_wEXHeATqmoo3BSLt2E2TBQYIua90JLCG_nET0jRM',
  running:           '1hDGtfqrt7iuearGvjMPoO_Xx9uhlvJsDewbpYRqSk4g',
  airRunnerPro:      '1pzRcPvQIZ9R6cDMPJU7MrBcHXYW3c-_Q3X4IA8QUSJM',
};

function populateAllDocs() {
  populateNav();
  populateCart();
  populateCheckout();
  populateOrderConfirmation();
  populateIndex();
  populateRunningCollection();
  populateAirRunnerPro();
  Logger.log('All documents populated!');
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function openBody(id) {
  var doc = DocumentApp.openById(id);
  var body = doc.getBody();
  body.clear();
  return { doc: doc, body: body };
}

function link(element, text, url) {
  element.setText(text);
  if (url) element.editAsText().setLinkUrl(0, text.length - 1, url);
  return element;
}

function h(body, text, level) {
  var headings = {
    1: DocumentApp.ParagraphHeading.HEADING1,
    2: DocumentApp.ParagraphHeading.HEADING2,
    3: DocumentApp.ParagraphHeading.HEADING3,
  };
  var p = body.appendParagraph(text);
  p.setHeading(headings[level]);
  return p;
}

function bullet(parent, text, url, nestLevel) {
  var item = parent.appendListItem(text);
  item.setGlyphType(DocumentApp.GlyphType.BULLET);
  item.setNestingLevel(nestLevel || 0);
  if (url) item.editAsText().setLinkUrl(0, text.length - 1, url);
  return item;
}

function fetchImage(url) {
  try {
    return UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getBlob();
  } catch (e) {
    return null;
  }
}

function insertImage(cell, url) {
  var blob = fetchImage(url);
  if (blob) {
    try {
      cell.appendImage(blob);
      return;
    } catch (e) { /* fall through */ }
  }
  cell.appendParagraph(url); // fallback: URL as text
}

function simpleBlock(body, blockName) {
  body.appendTable([[blockName], ['']]);
}

// ─── NAV ────────────────────────────────────────────────────────────────────

function populateNav() {
  var d = openBody(DOC_IDS.nav);
  var body = d.body;

  link(body.appendParagraph('StepUp').editAsText().setBold(true).getElement().asParagraph(), 'StepUp', '/');

  body.appendHorizontalRule();

  bullet(body, 'New Arrivals', '/collections/new-arrivals');
  bullet(body, 'Running', null);
  bullet(body, 'Road',  '/collections/running/road',  1);
  bullet(body, 'Trail', '/collections/running/trail', 1);
  bullet(body, 'Track', '/collections/running/track', 1);
  bullet(body, 'Lifestyle', null);
  bullet(body, 'Casual', '/collections/lifestyle/casual', 1);
  bullet(body, 'Sport',  '/collections/lifestyle/sport',  1);
  bullet(body, 'Training', '/collections/training');
  bullet(body, 'Sale',     '/collections/sale');

  body.appendHorizontalRule();

  link(body.appendParagraph('Cart'), 'Cart', '/cart');

  d.doc.saveAndClose();
  Logger.log('nav done');
}

// ─── CART / CHECKOUT / ORDER-CONFIRMATION ───────────────────────────────────

function populateCart() {
  var d = openBody(DOC_IDS.cart);
  simpleBlock(d.body, 'Cart');
  d.doc.saveAndClose();
  Logger.log('cart done');
}

function populateCheckout() {
  var d = openBody(DOC_IDS.checkout);
  simpleBlock(d.body, 'Checkout');
  d.doc.saveAndClose();
  Logger.log('checkout done');
}

function populateOrderConfirmation() {
  var d = openBody(DOC_IDS.orderConfirmation);
  simpleBlock(d.body, 'Order Confirmation');
  d.doc.saveAndClose();
  Logger.log('order-confirmation done');
}

// ─── INDEX ───────────────────────────────────────────────────────────────────

function populateIndex() {
  var d = openBody(DOC_IDS.index);
  var body = d.body;

  // Announcement bar
  body.appendParagraph('FREE SHIPPING ON ORDERS OVER $75 · USE CODE STEPUP10 FOR 10% OFF');

  // Hero
  var heroTable = body.appendTable([['Hero'], ['']]);
  var heroCell = heroTable.getRow(1).getCell(0);
  heroCell.clear();
  insertImage(heroCell, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80');
  h(heroCell, 'Run Farther. Feel Better.', 1);
  heroCell.appendParagraph('Engineered for performance, designed for style. New Spring 2025 collection now live.');
  link(heroCell.appendParagraph('Shop Now'), 'Shop Now', '/products/air-runner-pro');
  link(heroCell.appendParagraph('View All'), 'View All', '/collections/running');

  // Categories
  h(body, 'Shop by Category', 2);
  body.appendParagraph('Find your perfect fit');

  var catsTable = body.appendTable([['Columns', '', ''], ['', '', '']]);
  var cats = [
    { img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', name: 'Running',   url: '/collections/running',   desc: 'Built for speed and endurance on every terrain.' },
    { img: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80', name: 'Lifestyle', url: '/collections/lifestyle', desc: 'Everyday comfort that never compromises on style.' },
    { img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80', name: 'Training',  url: '/collections/training',  desc: 'Stability and support for your toughest workouts.' },
  ];
  cats.forEach(function (cat, i) {
    var cell = catsTable.getRow(1).getCell(i);
    cell.clear();
    insertImage(cell, cat.img);
    link(h(cell, cat.name, 3), cat.name, cat.url);
    cell.appendParagraph(cat.desc);
  });

  // New Arrivals cards
  h(body, 'New Arrivals', 2);
  body.appendParagraph('Fresh drops every week');

  var newArrivals = [
    { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', name: 'Air Runner Pro',   desc: 'Ultra-lightweight daily trainer with responsive cushioning.', price: '$149.99', url: '/products/air-runner-pro' },
    { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80', name: 'Cloud Walk X',    desc: 'All-day comfort with memory foam insole technology.',          price: '$119.99', url: '/products/cloud-walk-x' },
    { img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80', name: 'Trail Blazer GTX', desc: 'Waterproof Gore-Tex upper for any weather condition.',          price: '$189.99', url: '/products/trail-blazer-gtx' },
    { img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80', name: 'Urban Stride',    desc: 'Minimalist streetwear silhouette with premium leather.',        price: '$99.99',  url: '/products/urban-stride' },
  ];
  appendCardsBlock(body, newArrivals);

  // Promo hero
  var promoTable = body.appendTable([['Hero'], ['']]);
  var promoCell = promoTable.getRow(1).getCell(0);
  promoCell.clear();
  insertImage(promoCell, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80');
  h(promoCell, 'Up to 40% Off', 2);
  promoCell.appendParagraph('Limited time sale on select styles. While supplies last.');
  link(promoCell.appendParagraph('Shop Sale'), 'Shop Sale', '/collections/sale');

  // Why StepUp
  h(body, 'Why StepUp?', 2);
  var features = [
    { title: 'Free Shipping',          desc: 'On all orders over $75. Fast 2-day delivery to your door.' },
    { title: '30-Day Returns',         desc: 'Not the right fit? Send it back, no questions asked.' },
    { title: 'Expert Fit Guarantee',   desc: 'Our fit specialists help you find your perfect pair online.' },
    { title: 'Sustainable Materials',  desc: '30% of our collection uses recycled and responsibly sourced materials.' },
  ];
  var featTable = body.appendTable([['Columns', '', '', ''], ['', '', '', '']]);
  features.forEach(function (f, i) {
    var cell = featTable.getRow(1).getCell(i);
    cell.clear();
    h(cell, f.title, 3);
    cell.appendParagraph(f.desc);
  });

  d.doc.saveAndClose();
  Logger.log('index done');
}

// ─── RUNNING COLLECTION ──────────────────────────────────────────────────────

function populateRunningCollection() {
  var d = openBody(DOC_IDS.running);
  var body = d.body;

  var breadcrumb = body.appendParagraph('Home / Running');
  breadcrumb.editAsText().setLinkUrl(0, 3, '/');

  h(body, 'Running', 1);
  body.appendParagraph('Engineered for speed, endurance, and every terrain.');

  var products = [
    { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', name: 'Air Runner Pro',   desc: 'Ultra-lightweight daily trainer with responsive cushioning.',          price: '$149.99', sizes: ['7','8','9','10','11','12','13'], url: '/products/air-runner-pro' },
    { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80', name: 'Cloud Walk X',    desc: 'All-day comfort with memory foam insole technology.',                  price: '$119.99', sizes: ['6','7','8','9','10','11','12'], url: '/products/cloud-walk-x' },
    { img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80', name: 'Trail Blazer GTX', desc: 'Waterproof Gore-Tex upper for any weather condition.',                  price: '$189.99', sizes: ['7','8','9','10','11','12','13'], url: '/products/trail-blazer-gtx' },
    { img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80', name: 'Speed Racer Elite', desc: 'Carbon-plated race day shoe built for personal bests.',              price: '$229.99', sizes: ['8','9','10','11','12','13'],    url: '/products/speed-racer-elite' },
    { img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80', name: 'Pace Setter',    desc: 'Versatile everyday runner with plush cushioning and wide toe box.',   price: '$129.99', sizes: ['7','8','9','10','11','12'],    url: '/products/pace-setter' },
    { img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80', name: 'Enduro Long Run', desc: 'Maximum cushioning for marathon training and ultra-distance runs.',    price: '$159.99', sizes: ['7','8','9','10','11','12','13'], url: '/products/enduro-long-run' },
  ];

  var rows = [['Product Grid', '']];
  products.forEach(function () { rows.push(['', '']); });
  var table = body.appendTable(rows);

  products.forEach(function (p, i) {
    var imgCell = table.getRow(i + 1).getCell(0);
    imgCell.clear();
    insertImage(imgCell, p.img);

    var textCell = table.getRow(i + 1).getCell(1);
    textCell.clear();
    h(textCell, p.name, 3);
    textCell.appendParagraph(p.desc);
    textCell.appendParagraph(p.price);
    p.sizes.forEach(function (s) { bullet(textCell, s, null); });
    link(textCell.appendParagraph('View Product'), 'View Product', p.url);
  });

  d.doc.saveAndClose();
  Logger.log('running done');
}

// ─── AIR RUNNER PRO ──────────────────────────────────────────────────────────

function populateAirRunnerPro() {
  var d = openBody(DOC_IDS.airRunnerPro);
  var body = d.body;

  var bc = body.appendParagraph('Home / Running / Air Runner Pro');
  bc.editAsText()
    .setLinkUrl(0, 3, '/')
    .setLinkUrl(7, 13, '/collections/running');

  // Product block
  var productTable = body.appendTable([['Product', ''], ['', '']]);

  var imgCol = productTable.getRow(1).getCell(0);
  imgCol.clear();
  [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
  ].forEach(function (url) { insertImage(imgCol, url); });

  var detailCol = productTable.getRow(1).getCell(1);
  detailCol.clear();
  h(detailCol, 'Air Runner Pro', 1);
  detailCol.appendParagraph('$149.99');
  detailCol.appendParagraph('Our best-selling daily trainer, rebuilt from the ground up. The Air Runner Pro combines a breathable engineered mesh upper with our signature AirFoam midsole for a responsive, cloud-like ride every single step.');
  detailCol.appendParagraph("Whether you're logging easy miles or pushing tempo runs, the Air Runner Pro adapts to your stride with a dynamic flex groove outsole and heel-to-toe energy return.");
  ['7','8','9','10','11','12','13'].forEach(function (s) { bullet(detailCol, s, null); });
  link(detailCol.appendParagraph('Add to Cart'), 'Add to Cart', '#');
  link(detailCol.appendParagraph('Buy it Now'), 'Buy it Now', '#');

  // Product Specs block
  var specsTable = body.appendTable([['Product Specs'], [''], ['']]);

  var specsCell = specsTable.getRow(1).getCell(0);
  specsCell.clear();
  h(specsCell, 'Product Details', 3);
  ['Weight: 8.2 oz (men\'s size 9)', 'Drop: 8mm heel-to-toe', 'Upper: Engineered mesh with overlays',
   'Midsole: AirFoam dual-density cushioning', 'Outsole: High-traction rubber with flex grooves',
   'Fit: True to size — order your normal size']
    .forEach(function (s) { bullet(specsCell, s, null); });

  var shippingCell = specsTable.getRow(2).getCell(0);
  shippingCell.clear();
  h(shippingCell, 'Shipping & Returns', 3);
  ['Free standard shipping on orders over $75', 'Express 2-day shipping available at checkout',
   'Free returns within 30 days of purchase', 'Items must be unworn and in original packaging']
    .forEach(function (s) { bullet(shippingCell, s, null); });

  // You May Also Like
  h(body, 'You May Also Like', 2);
  body.appendParagraph('More from our running collection');

  var related = [
    { img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80', name: 'Cloud Walk X',    desc: 'All-day comfort with memory foam insole.',          price: '$119.99', url: '/products/cloud-walk-x' },
    { img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80', name: 'Trail Blazer GTX', desc: 'Waterproof Gore-Tex for any weather.',               price: '$189.99', url: '/products/trail-blazer-gtx' },
    { img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80', name: 'Urban Stride',    desc: 'Minimalist streetwear with premium leather.',        price: '$99.99',  url: '/products/urban-stride' },
  ];
  appendCardsBlock(body, related);

  d.doc.saveAndClose();
  Logger.log('air-runner-pro done');
}

// ─── Shared: Cards block ─────────────────────────────────────────────────────

function appendCardsBlock(body, products) {
  var rows = [['Cards', '']];
  products.forEach(function () { rows.push(['', '']); });
  var table = body.appendTable(rows);

  products.forEach(function (p, i) {
    var imgCell = table.getRow(i + 1).getCell(0);
    imgCell.clear();
    insertImage(imgCell, p.img);

    var textCell = table.getRow(i + 1).getCell(1);
    textCell.clear();
    h(textCell, p.name, 3);
    textCell.appendParagraph(p.desc);
    textCell.appendParagraph(p.price);
    link(textCell.appendParagraph('Shop Now'), 'Shop Now', p.url);
  });
}
