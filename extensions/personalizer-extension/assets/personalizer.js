document.addEventListener('DOMContentLoaded', async function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  // Try to load config from app proxy, fall back to theme editor config
  let config = window.PERSONALIZER_CONFIG || { label: 'Add your personalization', charLimit: 100, required: false };

  const proxyUrl = window.PERSONALIZER_PROXY_URL;
  if (proxyUrl) {
    try {
      const response = await fetch(proxyUrl);
      if (response.ok) {
        const apiConfig = await response.json();
        if (apiConfig.label) {
          config = apiConfig;
        }
      }
    } catch (err) {
      // Use fallback config
    }
  }

  // Apply config to DOM
  const labelEl = document.getElementById('personalizer-label');
  const inputEl = document.getElementById('personalizer-input');
  const countEl = document.getElementById('personalizer-count');
  const maxEl = document.getElementById('personalizer-max');
  const errorEl = document.getElementById('personalizer-error');
  const hiddenInput = document.getElementById('prop-personalization');

  if (labelEl) labelEl.textContent = config.label;
  if (inputEl) inputEl.maxLength = config.charLimit;
  if (maxEl) maxEl.textContent = config.charLimit;

  // Character count
  if (inputEl) {
    inputEl.addEventListener('input', function () {
      const len = inputEl.value.length;
      if (countEl) countEl.textContent = len;
      if (hiddenInput) hiddenInput.value = inputEl.value;
      if (errorEl) errorEl.style.display = 'none';
    });
  }

  // Form interception for required validation
  const productForm = container.closest('form[action*="/cart/add"]') ||
                      document.querySelector('form[action*="/cart/add"]');

  if (productForm && config.required) {
    productForm.addEventListener('submit', function (e) {
      if (!inputEl.value.trim()) {
        e.preventDefault();
        e.stopPropagation();
        if (errorEl) errorEl.style.display = 'block';
        inputEl.focus();
      }
    });
  }

  // Sync hidden input on form submit even if not required
  if (productForm) {
    productForm.addEventListener('submit', function () {
      if (hiddenInput) hiddenInput.value = inputEl.value;
    });
  }
});
