window.dataLayer = window.dataLayer || [];

export function pushEvent(payload) {
  window.dataLayer.push({ timestamp: Date.now(), ...payload });
}

export function parsePrice(str) {
  return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
}

function getPageType() {
  const { pathname } = window.location;
  if (pathname === '/' || pathname.endsWith('/index')) return 'home';
  if (pathname.startsWith('/collections/')) return 'collection';
  if (pathname.startsWith('/products/')) return 'product';
  if (pathname === '/cart') return 'cart';
  if (pathname === '/checkout') return 'checkout';
  if (pathname === '/order-confirmation') return 'confirmation';
  return 'other';
}

export function trackPageView() {
  pushEvent({
    event: 'page_view',
    page: {
      path: window.location.pathname,
      title: document.title,
      type: getPageType(),
    },
  });
}
