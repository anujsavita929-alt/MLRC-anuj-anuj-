/**
 * Accessible Modal Controller
 */
export function openModal(title, contentHtml) {
  let modalOverlay = document.getElementById('global-modal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'global-modal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title" id="global-modal-title"></h3>
          <button class="modal-close-btn" id="global-modal-close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal-body" id="global-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // Event listeners
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    document.getElementById('global-modal-close').addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeModal();
      }
    });
  }

  document.getElementById('global-modal-title').textContent = title;
  document.getElementById('global-modal-body').innerHTML = contentHtml;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  const modalOverlay = document.getElementById('global-modal');
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}
