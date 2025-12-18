document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  // Load Config from Liquid
  // Load Config from Liquid
  const config = window.PERSONALIZER_CONFIG || { slots: [], patches: [], textZone: { top: 25, left: 50 } };
  console.log('PERSONALIZER: Raw Config Loaded', config);
  console.log('PERSONALIZER: JS VERSION 23 LOADED (Custom dropdown with images)');

  // Filter slots to ensure they have an ID and Name
  const SLOTS = (config.slots || []).filter(s => s.id && s.name);

  // Filter patches to ensure they have an ID and Src
  const ALL_PATCHES = (config.patches || []).filter(p => p.id && p.src && p.src.trim() !== '');

  const TEXT_ZONE = config.textZone || { top: 25, left: 50 };

  // FALLBACK: If no slots are configured (e.g. fresh install or Liquid error), inject defaults
  if (SLOTS.length === 0) {
    console.warn('PERSONALIZER: No slots found in config. Using JS Fallback defaults.');
    SLOTS.push(
      { id: "1", name: "Chest", groupId: "chest", top: 30, left: 30, width: 12 },
      { id: "2", name: "Hip", groupId: "hip", top: 50, left: 30, width: 12 }
    );
  }

  // FALLBACK: If no patches are configured, inject defaults
  if (ALL_PATCHES.length === 0) {
    console.warn('PERSONALIZER: No patches found in config. Using JS Fallback defaults.');
    // Use a simple gray square as placeholder (base64 data URI to avoid 404)
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QYXRjaCBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';
    ALL_PATCHES.push(
      { id: "p1", name: "Star Patch", groupId: "chest", src: placeholderImage },
      { id: "p2", name: "Lightning Patch", groupId: "hip", src: placeholderImage }
    );
  }


  // State
  const state = {
    slots: {}, // Will be { slotId: patchId }
    text: ''
  };

  // Initialize State & Inputs
  const inputsContainer = document.getElementById('hidden-inputs-container');
  SLOTS.forEach(slot => {
    state.slots[slot.id] = null;

    // Create hidden input for this slot
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = `properties[${slot.name}]`;
    input.id = `prop-slot-${slot.id}`;
    inputsContainer.appendChild(input);
  });

  // Init
  initControls();
  updatePreview();

  function initControls() {
    const slotsContainer = document.getElementById('patch-slots');
    slotsContainer.innerHTML = ''; // Clear existing

    if (SLOTS.length === 0) {
      console.warn('PERSONALIZER: No slots found in config');
      slotsContainer.innerHTML = '<p>No slots configured. Please configure the "Personalizer Widget" settings in the Theme Editor.</p>';
      return;
    }

    SLOTS.forEach(slot => {
      // Filter patches for this slot based on Group ID
      const availablePatches = ALL_PATCHES.filter(p => p.groupId === slot.groupId);
      console.log(`PERSONALIZER: Slot ${slot.name} (Group: ${slot.groupId}) has ${availablePatches.length} patches`);

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
            ${availablePatches.map(patch => `
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

    const textInput = document.getElementById('embroidery-text');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        state.text = e.target.value;
        console.log('PERSONALIZER: Text updated', state.text);
        updatePreview();
        updateFormInputs();
      });
    }
  }

  window.toggleDropdown = function (slotId) {
    const options = document.getElementById(`dropdown-options-${slotId}`);
    const allOptions = document.querySelectorAll('.custom-dropdown-options');

    // Close all other dropdowns
    allOptions.forEach(opt => {
      if (opt.id !== `dropdown-options-${slotId}`) {
        opt.classList.remove('open');
      }
    });

    // Toggle this dropdown
    options.classList.toggle('open');
  };

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-dropdown')) {
      document.querySelectorAll('.custom-dropdown-options').forEach(opt => {
        opt.classList.remove('open');
      });
    }
  });

  window.selectPatchFromDropdown = function (slotId, patchId) {
    console.log(`PERSONALIZER: Selecting patch ${patchId} for slot ${slotId}`);

    // Set the selected patch (empty string means deselect)
    state.slots[slotId] = patchId || null;

    // Update the custom dropdown display
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

      // Close the dropdown
      options.classList.remove('open');
    }

    updatePreview();
    updateFormInputs();
  };

  // Legacy function for backwards compatibility
  window.selectPatch = function (slotId, patchId) {
    window.selectPatchFromDropdown(slotId, patchId);
  };

  function updatePreview() {
    const overlay = document.getElementById('preview-overlay');
    if (!overlay) return;
    overlay.innerHTML = '';

    // Render Patches
    SLOTS.forEach(slot => {
      const patchId = state.slots[slot.id];
      if (patchId) {
        const patch = ALL_PATCHES.find(p => p.id === patchId);
        if (patch) {
          console.log(`PERSONALIZER: Rendering patch ${patch.name} at ${slot.top}%, ${slot.left}%`);
          const img = document.createElement('img');
          img.src = patch.src;
          img.className = 'patch-element';
          img.style.top = `${slot.top}%`;
          img.style.left = `${slot.left}%`;
          img.style.width = `${slot.width}%`;
          img.style.position = 'absolute'; // Ensure absolute positioning
          img.style.zIndex = '10'; // Force on top
          overlay.appendChild(img);
        }
      }
    });

    // Render Text
    if (state.text) {
      const textDiv = document.createElement('div');
      textDiv.className = 'text-overlay';
      textDiv.textContent = state.text;
      textDiv.style.top = `${TEXT_ZONE.top}%`;
      textDiv.style.left = `${TEXT_ZONE.left}%`;
      textDiv.style.position = 'absolute';
      textDiv.style.zIndex = '20'; // Force on top of patches
      overlay.appendChild(textDiv);
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
    if (textInput) textInput.value = state.text;
  }
});
