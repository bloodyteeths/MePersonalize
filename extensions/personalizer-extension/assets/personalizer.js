document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector('.personalizer-container');
  if (!container) return;

  // Configuration
  const PATCHES = Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString().padStart(2, '0'),
    name: `Patch ${i + 1}`,
    src: `https://via.placeholder.com/100?text=${i + 1}` // Placeholder
  }));

  const SLOTS = [
    { id: 1, name: 'Right Chest', top: 38, left: 38, width: 12 },
    { id: 2, name: 'Left Chest', top: 38, left: 62, width: 12 },
    { id: 3, name: 'Right Hip', top: 52, left: 38, width: 12 },
    { id: 4, name: 'Left Hip', top: 52, left: 62, width: 12 },
    { id: 5, name: 'Hat', top: 8, left: 50, width: 15 }
  ];

  const TEXT_ZONE = { top: 25, left: 50 }; // Approximate location for name

  // State
  const state = {
    slots: { 1: null, 2: null, 3: null, 4: null, 5: null },
    text: ''
  };

  // Init
  initControls();
  updatePreview();

  function initControls() {
    const slotsContainer = document.getElementById('patch-slots');
    
    SLOTS.forEach(slot => {
      const slotDiv = document.createElement('div');
      slotDiv.className = 'patch-slot-control';
      slotDiv.innerHTML = `
        <label>Slot ${slot.id} (${slot.name})</label>
        <div class="patch-grid" data-slot-id="${slot.id}">
          ${PATCHES.map(patch => `
            <div class="patch-option" data-patch-id="${patch.id}" onclick="selectPatch(${slot.id}, '${patch.id}')">
              <img src="${patch.src}" alt="${patch.name}">
            </div>
          `).join('')}
        </div>
      `;
      slotsContainer.appendChild(slotDiv);
    });

    const textInput = document.getElementById('embroidery-text');
    textInput.addEventListener('input', (e) => {
      state.text = e.target.value;
      updatePreview();
      updateFormInputs();
    });
  }

  window.selectPatch = function(slotId, patchId) {
    // Toggle: if already selected, deselect
    if (state.slots[slotId] === patchId) {
      state.slots[slotId] = null;
    } else {
      state.slots[slotId] = patchId;
    }
    
    // Update UI selection state
    const grid = document.querySelector(`.patch-grid[data-slot-id="${slotId}"]`);
    grid.querySelectorAll('.patch-option').forEach(opt => opt.classList.remove('selected'));
    if (state.slots[slotId]) {
      grid.querySelector(`.patch-option[data-patch-id="${patchId}"]`).classList.add('selected');
    }

    updatePreview();
    updateFormInputs();
  };

  function updatePreview() {
    const overlay = document.getElementById('preview-overlay');
    overlay.innerHTML = '';

    // Render Patches
    SLOTS.forEach(slot => {
      const patchId = state.slots[slot.id];
      if (patchId) {
        const patch = PATCHES.find(p => p.id === patchId);
        if (patch) {
          const img = document.createElement('img');
          img.src = patch.src;
          img.className = 'patch-element';
          img.style.top = `${slot.top}%`;
          img.style.left = `${slot.left}%`;
          img.style.width = `${slot.width}%`;
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
      overlay.appendChild(textDiv);
    }
  }

  function updateFormInputs() {
    document.getElementById('prop-patch-1').value = state.slots[1] ? `Patch ${state.slots[1]}` : '';
    document.getElementById('prop-patch-2').value = state.slots[2] ? `Patch ${state.slots[2]}` : '';
    document.getElementById('prop-patch-3').value = state.slots[3] ? `Patch ${state.slots[3]}` : '';
    document.getElementById('prop-patch-4').value = state.slots[4] ? `Patch ${state.slots[4]}` : '';
    document.getElementById('prop-patch-5').value = state.slots[5] ? `Patch ${state.slots[5]}` : '';
    document.getElementById('prop-text').value = state.text;
  }
});
