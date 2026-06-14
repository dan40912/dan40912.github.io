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
                const title = button.dataset.modalTitle || '截圖預覽';
                const text = button.dataset.modalText || '請在這裡補上實際圖片或預設文字。';
                const previewImage = button.closest('.screenshot-cell')?.querySelector('.screenshot-preview img');
                const src = previewImage?.getAttribute('src') || '';
                const hasRealImage = Boolean(src && src !== 'XXX');

                modalTitle.textContent = title;
                modalDescription.textContent = text;
                modalPreview.innerHTML = '';

                if (hasRealImage) {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = title;

                    const titleEl = document.createElement('div');
                    titleEl.className = 'placeholder-title';
                    titleEl.textContent = title;

                    const textEl = document.createElement('div');
                    textEl.className = 'placeholder-text';
                    textEl.textContent = text;

                    modalPreview.appendChild(img);
                    modalPreview.appendChild(titleEl);
                    modalPreview.appendChild(textEl);
                } else {
                    const titleEl = document.createElement('div');
                    titleEl.className = 'placeholder-title';
                    titleEl.textContent = title;

                    const textEl = document.createElement('div');
                    textEl.className = 'placeholder-text';
                    textEl.textContent = text;

                    const noteEl = document.createElement('div');
                    noteEl.className = 'placeholder-text';
                    noteEl.textContent = '這一列目前使用靜態占位圖，請把表格中的 img src 改成實際圖片路徑後再顯示大圖。';

                    modalPreview.appendChild(titleEl);
                    modalPreview.appendChild(textEl);
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

            rows.forEach((row) => { row.hidden = false; });
            proofToolbar?.classList.add('is-hidden');
            setActiveCard('all');
        })();
    
