document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  const config = window.PERSONALIZER_CONFIG || { slots: [], patches: [], textZone: {}, backTextZone: {} };
  console.log('PERSONALIZER: JS VERSION 26 (6 slots, unified patches, back text)');
  console.log('Config:', config);

  const SLOTS = config.slots || [];
  const ALL_PATCHES = (config.patches || []).filter(p => p.id && p.src);
  const TEXT_ZONE = config.textZone || { top: 25, left: 50 };
  const BACK_TEXT_ZONE = config.backTextZone || { top: 30, left: 50 };

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
});
