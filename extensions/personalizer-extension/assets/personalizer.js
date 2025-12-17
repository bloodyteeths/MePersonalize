document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  // Load Config from Liquid
  // Load Config from Liquid
  const config = window.PERSONALIZER_CONFIG || { slots: [], patches: [], textZone: { top: 25, left: 50 } };
  console.log('PERSONALIZER: Raw Config Loaded', config);
  console.log('PERSONALIZER: JS VERSION 22 LOADED (Dropdown UI)');

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
        <div class="patch-dropdown-container" data-slot-id="${slot.id}">
          <select class="patch-dropdown" onchange="selectPatchFromDropdown('${slot.id}', this.value)">
            <option value="">-- Select a patch --</option>
            ${availablePatches.map(patch => `
              <option value="${patch.id}" data-src="${patch.src}">${patch.name}</option>
            `).join('')}
          </select>
          <div class="patch-preview-thumbnail">
            <img src="" alt="Selected patch preview" style="display: none;">
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

  window.selectPatchFromDropdown = function (slotId, patchId) {
    console.log(`PERSONALIZER: Selecting patch ${patchId} for slot ${slotId}`);

    // Set the selected patch (empty string means deselect)
    state.slots[slotId] = patchId || null;

    // Update thumbnail preview next to dropdown
    const container = document.querySelector(`.patch-dropdown-container[data-slot-id="${slotId}"]`);
    if (container) {
      const thumbnailImg = container.querySelector('.patch-preview-thumbnail img');
      if (thumbnailImg) {
        if (patchId) {
          const patch = ALL_PATCHES.find(p => p.id === patchId);
          if (patch) {
            thumbnailImg.src = patch.src;
            thumbnailImg.style.display = 'block';
          }
        } else {
          thumbnailImg.src = '';
          thumbnailImg.style.display = 'none';
        }
      }
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
