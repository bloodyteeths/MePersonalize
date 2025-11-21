document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  // Load Config from Liquid
  const config = window.PERSONALIZER_CONFIG || { slots: [], patches: [], textZone: { top: 25, left: 50 } };
  console.log('PERSONALIZER: Config Loaded', config);

  const SLOTS = config.slots.filter(s => s.name && s.name.trim() !== '');
  const ALL_PATCHES = config.patches.filter(p => p.src && p.src.trim() !== '');
  const TEXT_ZONE = config.textZone;

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
        <div class="patch-grid" data-slot-id="${slot.id}">
          ${availablePatches.length > 0 ? availablePatches.map(patch => `
            <div class="patch-option" data-patch-id="${patch.id}" onclick="selectPatch('${slot.id}', '${patch.id}')">
              <img src="${patch.src}" alt="${patch.name}">
              <span class="patch-name">${patch.name}</span>
            </div>
          `).join('') : '<p class="no-patches">No patches found for group "' + slot.groupId + '"</p>'}
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

  window.selectPatch = function (slotId, patchId) {
    console.log(`PERSONALIZER: Selecting patch ${patchId} for slot ${slotId}`);
    // Toggle: if already selected, deselect
    if (state.slots[slotId] === patchId) {
      state.slots[slotId] = null;
    } else {
      state.slots[slotId] = patchId;
    }

    // Update UI selection state
    const grid = document.querySelector(`.patch-grid[data-slot-id="${slotId}"]`);
    if (grid) {
      grid.querySelectorAll('.patch-option').forEach(opt => opt.classList.remove('selected'));
      if (state.slots[slotId]) {
        grid.querySelector(`.patch-option[data-patch-id="${patchId}"]`).classList.add('selected');
      }
    }

    updatePreview();
    updateFormInputs();
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
