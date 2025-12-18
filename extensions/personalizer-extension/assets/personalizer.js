document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  const config = window.PERSONALIZER_CONFIG || { slots: [], patches: [], textZone: {}, backTextZone: {} };
  console.log('PERSONALIZER: JS VERSION 27 (name fees)');
  console.log('Config:', config);

  const SLOTS = config.slots || [];
  const ALL_PATCHES = (config.patches || []).filter(p => p.id && p.src);
  const TEXT_ZONE = config.textZone || { top: 25, left: 50 };
  const BACK_TEXT_ZONE = config.backTextZone || { top: 30, left: 50 };
  const FRONT_NAME_FEE_VARIANT = config.frontNameFeeVariant || '';
  const BACK_NAME_FEE_VARIANT = config.backNameFeeVariant || '';

  // State
  const state = {
    slots: {},
    frontText: '',
    backText: '',
    backTextColor: 'white'
  };

  // Initialize State & Hidden Inputs
  const inputsContainer = document.getElementById('hidden-inputs-container');
  SLOTS.forEach(slot => {
    state.slots[slot.id] = null;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = `properties[${slot.name}]`;
    input.id = `prop-slot-${slot.id}`;
    inputsContainer.appendChild(input);
  });

  // Init
  initControls();
  initTabs();
  initColorSelector();
  updatePreview();

  function initControls() {
    const slotsContainer = document.getElementById('patch-slots');
    slotsContainer.innerHTML = '';

    SLOTS.forEach(slot => {
      const slotDiv = document.createElement('div');
      slotDiv.className = 'patch-slot-control';
      slotDiv.innerHTML = `
        <label>${slot.name}</label>
        <div class="custom-dropdown" data-slot-id="${slot.id}">
          <div class="custom-dropdown-selected" onclick="toggleDropdown('${slot.id}')">
            <span class="selected-text">-- Select a patch --</span>
            <span class="dropdown-arrow">▼</span>
          </div>
          <div class="custom-dropdown-options" id="dropdown-options-${slot.id}">
            <div class="custom-dropdown-option" data-patch-id="" onclick="selectPatchFromDropdown('${slot.id}', '')">
              <span class="option-text">-- None --</span>
            </div>
            ${ALL_PATCHES.map(patch => `
              <div class="custom-dropdown-option" data-patch-id="${patch.id}" onclick="selectPatchFromDropdown('${slot.id}', '${patch.id}')">
                <img src="${patch.src}" alt="${patch.name}">
                <span class="option-text">${patch.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      slotsContainer.appendChild(slotDiv);
    });

    // Front text input
    const textInput = document.getElementById('embroidery-text');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        state.frontText = e.target.value;
        updatePreview();
        updateFormInputs();
      });
    }

    // Back text input
    const backTextInput = document.getElementById('back-text');
    if (backTextInput) {
      backTextInput.addEventListener('input', (e) => {
        state.backText = e.target.value;
        updatePreview();
        updateFormInputs();
      });
    }
  }

  function initTabs() {
    const tabs = document.querySelectorAll('.preview-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabName = tab.dataset.tab;
        document.getElementById('front-preview').style.display = tabName === 'front' ? 'block' : 'none';
        document.getElementById('back-preview').style.display = tabName === 'back' ? 'block' : 'none';
      });
    });
  }

  function initColorSelector() {
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.backTextColor = btn.dataset.color;
        updatePreview();
        updateFormInputs();
      });
    });
  }

  window.toggleDropdown = function (slotId) {
    const options = document.getElementById(`dropdown-options-${slotId}`);
    const allOptions = document.querySelectorAll('.custom-dropdown-options');
    allOptions.forEach(opt => {
      if (opt.id !== `dropdown-options-${slotId}`) opt.classList.remove('open');
    });
    options.classList.toggle('open');
  };

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-dropdown')) {
      document.querySelectorAll('.custom-dropdown-options').forEach(opt => opt.classList.remove('open'));
    }
  });

  window.selectPatchFromDropdown = function (slotId, patchId) {
    state.slots[slotId] = patchId || null;

    const dropdown = document.querySelector(`.custom-dropdown[data-slot-id="${slotId}"]`);
    if (dropdown) {
      const selectedDisplay = dropdown.querySelector('.custom-dropdown-selected');
      const options = dropdown.querySelector('.custom-dropdown-options');

      if (patchId) {
        const patch = ALL_PATCHES.find(p => p.id === patchId);
        if (patch) {
          selectedDisplay.innerHTML = `
            <img src="${patch.src}" alt="${patch.name}" class="selected-patch-img">
            <span class="selected-text">${patch.name}</span>
            <span class="dropdown-arrow">▼</span>
          `;
        }
      } else {
        selectedDisplay.innerHTML = `
          <span class="selected-text">-- Select a patch --</span>
          <span class="dropdown-arrow">▼</span>
        `;
      }
      options.classList.remove('open');
    }

    updatePreview();
    updateFormInputs();
  };

  function updatePreview() {
    // Front preview
    const frontOverlay = document.getElementById('preview-overlay');
    if (frontOverlay) {
      frontOverlay.innerHTML = '';

      // Render patches
      SLOTS.forEach(slot => {
        const patchId = state.slots[slot.id];
        if (patchId) {
          const patch = ALL_PATCHES.find(p => p.id === patchId);
          if (patch) {
            const img = document.createElement('img');
            img.src = patch.src;
            img.className = 'patch-element';
            img.style.top = `${slot.top}%`;
            img.style.left = `${slot.left}%`;
            img.style.width = `${slot.width}%`;
            img.style.position = 'absolute';
            img.style.zIndex = '10';
            frontOverlay.appendChild(img);
          }
        }
      });

      // Render front text
      if (state.frontText) {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-overlay';
        textDiv.textContent = state.frontText;
        textDiv.style.top = `${TEXT_ZONE.top}%`;
        textDiv.style.left = `${TEXT_ZONE.left}%`;
        frontOverlay.appendChild(textDiv);
      }
    }

    // Back preview
    const backOverlay = document.getElementById('back-overlay');
    if (backOverlay) {
      backOverlay.innerHTML = '';

      if (state.backText) {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-overlay back-text';
        textDiv.textContent = state.backText;
        textDiv.style.top = `${BACK_TEXT_ZONE.top}%`;
        textDiv.style.left = `${BACK_TEXT_ZONE.left}%`;
        textDiv.style.color = state.backTextColor;
        textDiv.style.textShadow = state.backTextColor === 'white' ? '1px 1px 2px black' : '1px 1px 2px white';
        backOverlay.appendChild(textDiv);
      }
    }
  }

  function updateFormInputs() {
    SLOTS.forEach(slot => {
      const input = document.getElementById(`prop-slot-${slot.id}`);
      const patchId = state.slots[slot.id];
      if (input) {
        if (patchId) {
          const patch = ALL_PATCHES.find(p => p.id === patchId);
          input.value = patch ? patch.name : '';
        } else {
          input.value = '';
        }
      }
    });

    const textInput = document.getElementById('prop-text');
    if (textInput) textInput.value = state.frontText;

    const backTextInput = document.getElementById('prop-back-text');
    if (backTextInput) backTextInput.value = state.backText;

    const backColorInput = document.getElementById('prop-back-color');
    if (backColorInput) backColorInput.value = state.backTextColor;
  }

  // Intercept form submission to add fee products
  function initFormInterception() {
    // Find the product form (could be in different locations depending on theme)
    const productForm = container.closest('form[action*="/cart/add"]') ||
                        document.querySelector('form[action*="/cart/add"]');

    if (!productForm) {
      console.log('PERSONALIZER: No product form found, fee products will not be added automatically');
      return;
    }

    console.log('PERSONALIZER: Form interception initialized');

    productForm.addEventListener('submit', async function(e) {
      // Check if we need to add fee products
      const needsFrontFee = state.frontText.trim() && FRONT_NAME_FEE_VARIANT;
      const needsBackFee = state.backText.trim() && BACK_NAME_FEE_VARIANT;

      if (!needsFrontFee && !needsBackFee) {
        // No fees needed, let form submit normally
        return;
      }

      // Prevent default form submission
      e.preventDefault();
      e.stopPropagation();

      // Get the main product variant ID from the form
      const variantInput = productForm.querySelector('input[name="id"]') ||
                           productForm.querySelector('select[name="id"]');
      const mainVariantId = variantInput ? variantInput.value : null;

      if (!mainVariantId) {
        console.error('PERSONALIZER: Could not find main product variant ID');
        productForm.submit();
        return;
      }

      // Build the items array for cart
      const items = [];

      // Add main product with properties
      const mainProductItem = {
        id: mainVariantId,
        quantity: 1,
        properties: {}
      };

      // Add slot properties
      SLOTS.forEach(slot => {
        const patchId = state.slots[slot.id];
        if (patchId) {
          const patch = ALL_PATCHES.find(p => p.id === patchId);
          if (patch) {
            mainProductItem.properties[slot.name] = patch.name;
          }
        }
      });

      // Add text properties
      if (state.frontText.trim()) {
        mainProductItem.properties['Embroidery Text'] = state.frontText;
      }
      if (state.backText.trim()) {
        mainProductItem.properties['Back Text'] = state.backText;
        mainProductItem.properties['Back Text Color'] = state.backTextColor;
      }

      items.push(mainProductItem);

      // Add front name fee if needed
      if (needsFrontFee) {
        items.push({
          id: FRONT_NAME_FEE_VARIANT,
          quantity: 1,
          properties: {
            '_fee_for': 'Front Name Embroidery'
          }
        });
        console.log('PERSONALIZER: Adding front name fee variant:', FRONT_NAME_FEE_VARIANT);
      }

      // Add back name fee if needed
      if (needsBackFee) {
        items.push({
          id: BACK_NAME_FEE_VARIANT,
          quantity: 1,
          properties: {
            '_fee_for': 'Back Name Embroidery'
          }
        });
        console.log('PERSONALIZER: Adding back name fee variant:', BACK_NAME_FEE_VARIANT);
      }

      try {
        // Add all items to cart using Shopify Cart API
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ items: items })
        });

        if (response.ok) {
          console.log('PERSONALIZER: Items added to cart successfully');
          // Redirect to cart or trigger cart update
          window.location.href = '/cart';
        } else {
          const errorData = await response.json();
          console.error('PERSONALIZER: Cart add failed:', errorData);
          alert('Error adding to cart: ' + (errorData.description || 'Unknown error'));
        }
      } catch (error) {
        console.error('PERSONALIZER: Cart add error:', error);
        alert('Error adding to cart. Please try again.');
      }
    });
  }

  // Initialize form interception
  initFormInterception();
});
