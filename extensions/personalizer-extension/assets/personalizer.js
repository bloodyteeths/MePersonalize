document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  const inputEl = document.getElementById('personalizer-input');
  const countEl = document.getElementById('personalizer-count');
  const errorEl = document.getElementById('personalizer-error');
  const hiddenInput = document.getElementById('prop-personalization');
  const isRequired = inputEl && inputEl.dataset.required === 'true';

  if (!inputEl) return;

  // Move the widget into the product form, right before the submit/add-to-cart button
  const productForm = document.querySelector('form[action*="/cart/add"]');
  if (productForm) {
    const submitBtn = productForm.querySelector('[type="submit"], button[name="add"]');
    if (submitBtn) {
      submitBtn.parentNode.insertBefore(container, submitBtn);
    } else {
      productForm.appendChild(container);
    }
  }

  // Character count + sync hidden input
  inputEl.addEventListener('input', function () {
    if (countEl) countEl.textContent = inputEl.value.length;
    if (hiddenInput) hiddenInput.value = inputEl.value;
    if (errorEl) errorEl.style.display = 'none';
  });

  // Form validation
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      if (hiddenInput) hiddenInput.value = inputEl.value;

      if (isRequired && !inputEl.value.trim()) {
        e.preventDefault();
        e.stopPropagation();
        if (errorEl) errorEl.style.display = 'block';
        inputEl.focus();
      }
    });
  }
});
