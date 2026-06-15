(function () {
    const modal = document.getElementById('proof-modal');
    const modalClose = document.getElementById('proof-modal-close');
    const modalTitle = document.getElementById('proof-modal-title');
    const modalDescription = document.getElementById('proof-modal-description');
    const modalPreview = document.getElementById('proof-modal-preview');
    const triggers = Array.from(document.querySelectorAll('.screenshot-trigger'));

    if (!modal || !modalClose || !modalTitle || !modalDescription || !modalPreview || !triggers.length) return;

    const openModal = (button) => {
        const media = button.closest('.case-media');
        const image = media?.querySelector('img');
        const src = image?.getAttribute('src');

        if (!src) return;

        modalTitle.textContent = button.dataset.modalTitle || image.alt || 'Evidence preview';
        modalDescription.textContent = button.dataset.modalText || image.alt || 'Product artifact image';
        modalPreview.innerHTML = '';

        const largeImage = document.createElement('img');
        largeImage.src = src;
        largeImage.alt = image.alt || modalTitle.textContent;
        modalPreview.appendChild(largeImage);

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        modalPreview.innerHTML = '';
        document.body.style.overflow = '';
    };

    triggers.forEach((button) => {
        button.addEventListener('click', () => openModal(button));
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    modalClose.addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
})();
