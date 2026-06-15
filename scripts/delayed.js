function dispatchToSDK(payload) {
  const rf = window.ResultFlow;
  if (!rf) return;
  const { event, timestamp, ...data } = payload;

  switch (event) {
    case 'page_view':
      rf.page(data.page);
      break;
    case 'product_view':
      rf.productViewed(data.product);
      break;
    case 'add_to_cart':
      rf.addToCart(data.product);
      break;
    case 'remove_from_cart':
      rf.removeFromCart(data.product);
      break;
    case 'cart_view':
      rf.cartViewed(data.cart);
      break;
    case 'begin_checkout':
      rf.checkoutStarted(data.cart);
      break;
    case 'purchase':
      rf.purchase(data.order);
      break;
    case 'product_list_view':
      rf.productListViewed(data.list.items, data.list.name);
      break;
    case 'image_view':
      rf.trackImageClick(data.product.id, data.product.image_index);
      break;
    case 'size_selected':
      rf.trackVariantSelect(data.product);
      break;
    default:
      rf.track(event, data);
  }
}

function initResultFlow() {
  window.ResultFlow.init({
    apiKey: '3ehO9ojTTTarG5x65ON5L2qfBPBhBhvzaYfhv85U',
    endpoint: 'https://staging-eventpipe.resultflow.ai/v1',
    debug: true,
    autoTrack: true,
    session: { timeout: 1800 },
    privacy: { respectDNT: true },
  });

  // Replay events that fired before the SDK loaded
  (window.dataLayer || []).forEach(dispatchToSDK);

  // Forward all future dataLayer pushes to the SDK
  const originalPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = (payload) => {
    originalPush(payload);
    dispatchToSDK(payload);
  };
}

const script = document.createElement('script');
script.src = 'https://staging-eventpipe.resultflow.ai/embed/resultflow.min.js';
script.onload = initResultFlow;
document.head.append(script);
