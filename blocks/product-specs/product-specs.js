export default function decorate(block) {
  block.querySelectorAll('h3').forEach((h) => {
    const section = document.createElement('details');
    section.className = 'product-specs-item';
    section.open = h.closest('div') === block.querySelector('div > div:first-child');

    const summary = document.createElement('summary');
    summary.textContent = h.textContent;
    section.append(summary);

    const body = document.createElement('div');
    body.className = 'product-specs-body';
    let next = h.nextElementSibling;
    while (next) {
      body.append(next.cloneNode(true));
      next = next.nextElementSibling;
    }
    section.append(body);
    h.closest('div').replaceWith(section);
  });
}
