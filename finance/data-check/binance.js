(function () {
    const cards = Array.from(document.querySelectorAll('#focus .focus-card[data-filter]'));
    const rows = Array.from(document.querySelectorAll('#proof-snapshot tbody tr[data-categories]'));
    const filterButtons = Array.from(document.querySelectorAll('.proof-filter-btn[data-filter]'));
    const proofToolbar = document.querySelector('.proof-toolbar');
    const proofSnapshot = document.getElementById('proof-snapshot');
    const modal = document.getElementById('proof-modal');
    const modalClose = document.getElementById('proof-modal-close');
    const modalTitle = document.getElementById('proof-modal-title');
    const modalDescription = document.getElementById('proof-modal-description');
    const modalPreview = document.getElementById('proof-modal-preview');

    if (!cards.length || !rows.length || !modal || !modalClose || !modalTitle || !modalDescription || !modalPreview) return;

    const setActiveCard = (targetFilter) => {
        cards.forEach((card) => {
            const active = card.dataset.filter === targetFilter;
            card.classList.toggle('is-active', active);
            card.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        filterButtons.forEach((button) => {
            const active = button.dataset.filter === targetFilter;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    };

    const applyFilter = (filter) => {
        if (filter === 'all') {
            rows.forEach((row) => { row.hidden = false; });
            proofToolbar?.classList.add('is-hidden');
            setActiveCard('all');
            return;
        }

        rows.forEach((row) => {
            const categories = (row.dataset.categories || '').split(/\s+/).filter(Boolean);
            row.hidden = !categories.includes(filter);
        });

        proofToolbar?.classList.remove('is-hidden');
        setActiveCard(filter);
    };

    const jumpToProofTable = () => {
        proofSnapshot?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openModal = (button) => {
        const cell = button.closest('.screenshot-cell');
        const title = button.dataset.modalTitle || '案例截圖';
        const text = button.dataset.modalText || '點擊案例截圖後，可放大檢視產品流程或證據畫面。';
        const previewImage = cell?.querySelector('.screenshot-preview img');
        const richContent = cell?.querySelector('.modal-rich-content');
        const src = previewImage?.getAttribute('src') || '';
        const hasRealImage = Boolean(src && src !== 'XXX');

        modalTitle.textContent = title;
        modalDescription.textContent = text;
        modalPreview.innerHTML = '';

        if (hasRealImage) {
            const img = document.createElement('img');
            img.src = src;
            img.alt = title;
            modalPreview.appendChild(img);
        }

        const titleEl = document.createElement('div');
        titleEl.className = 'placeholder-title';
        titleEl.textContent = title;

        const textEl = document.createElement('div');
        textEl.className = 'placeholder-text';
        textEl.textContent = text;

        modalPreview.appendChild(titleEl);
        modalPreview.appendChild(textEl);

        if (richContent) {
            const clonedContent = richContent.cloneNode(true);
            clonedContent.hidden = false;
            modalPreview.appendChild(clonedContent);
        } else if (!hasRealImage) {
            const noteEl = document.createElement('div');
            noteEl.className = 'placeholder-text';
            noteEl.textContent = '這個案例尚未放入截圖或補充資料。';
            modalPreview.appendChild(noteEl);
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            applyFilter(card.dataset.filter);
            jumpToProofTable();
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                applyFilter(card.dataset.filter);
                jumpToProofTable();
            }
        });
    });

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => applyFilter(button.dataset.filter));
    });

    document.querySelectorAll('.screenshot-trigger').forEach((button) => {
        button.addEventListener('click', () => openModal(button));
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    modalClose.addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    applyFilter(cards[0]?.dataset.filter || 'all');
})();
