document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  const inputEl = document.getElementById('personalizer-input');
  const countEl = document.getElementById('personalizer-count');
  const errorEl = document.getElementById('personalizer-error');
  const hiddenInput = document.getElementById('prop-personalization');
  const isRequired = inputEl && inputEl.dataset.required === 'true';

  if (!inputEl) return;

  // Find the product form and insert the widget right before it
  // (after variant selectors and quantity, before the add-to-cart button)
  const productFormWrapper = document.querySelector('product-form');
  const productForm = document.querySelector('form[action*="/cart/add"][data-type="add-to-cart-form"]') ||
                      document.querySelector('product-form form[action*="/cart/add"]') ||
                      document.querySelector('form[action*="/cart/add"]');

  if (productFormWrapper) {
    // Insert before the <product-form> element (after variant selectors)
    productFormWrapper.parentNode.insertBefore(container, productFormWrapper);
  }

  // Character count + sync hidden input
  inputEl.addEventListener('input', function () {
    if (countEl) countEl.textContent = inputEl.value.length;
    if (hiddenInput) hiddenInput.value = inputEl.value;
    if (errorEl) errorEl.style.display = 'none';
  });

  // On form submit: copy value into a hidden input inside the actual form
  if (productForm) {
    // Create a hidden input inside the form so the value gets submitted
    const formInput = document.createElement('input');
    formInput.type = 'hidden';
    formInput.name = 'properties[Personalization]';
    productForm.appendChild(formInput);

    productForm.addEventListener('submit', function (e) {
      formInput.value = inputEl.value;

      if (isRequired && !inputEl.value.trim()) {
        e.preventDefault();
        e.stopPropagation();
        if (errorEl) errorEl.style.display = 'block';
        inputEl.focus();
      }
    });
  }
});
