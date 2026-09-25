document.addEventListener('DOMContentLoaded', () => {
    let notes = JSON.parse(localStorage.getItem('darknotes_data')) || [];
    let editingNoteId = null;

    const notesList = document.getElementById('notesList');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const fab = document.getElementById('fab');
    const noteModal = document.getElementById('noteModal');
    const closeModal = document.getElementById('closeModal');
    const saveNoteBtn = document.getElementById('saveNote');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteBodyInput = document.getElementById('noteBody');
    const modalTitleText = document.getElementById('modalTitle');

    const saveToStorage = () => {
        localStorage.setItem('darknotes_data', JSON.stringify(notes));
    };

    const renderNotes = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const sortOrder = sortSelect.value;

        let filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.body.toLowerCase().includes(searchTerm)
        );

        if (sortOrder === 'newest') {
            filteredNotes.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            filteredNotes.sort((a, b) => a.timestamp - b.timestamp);
        }

        notesList.innerHTML = '';
        
        if (filteredNotes.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            filteredNotes.forEach(note => {
                const card = document.createElement('div');
                card.className = 'note-card';
                
                const dateStr = new Date(note.timestamp).toLocaleDateString([], { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });

                card.innerHTML = `
                    <button class="delete-btn" data-id="${note.id}">&times;</button>
                    <h3>${escapeHtml(note.title)}</h3>
                    <p>${escapeHtml(note.body)}</p>
                    <span class="date">${dateStr}</span>
                `;

                card.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('delete-btn')) {
                        openModal(note);
                    }
                });

                card.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                });

                notesList.appendChild(card);
            });
        }
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const openModal = (note = null) => {
        if (note) {
            editingNoteId = note.id;
            modalTitleText.textContent = 'Edit Note';
            noteTitleInput.value = note.title;
            noteBodyInput.value = note.body;
        } else {
            editingNoteId = null;
            modalTitleText.textContent = 'New Note';
            noteTitleInput.value = '';
            noteBodyInput.value = '';
        }
        noteModal.classList.remove('hidden');
        noteTitleInput.focus();
    };

    const closeNoteModal = () => {
        noteModal.classList.add('hidden');
    };

    const saveNote = () => {
        const title = noteTitleInput.value.trim() || 'Untitled Note';
        const body = noteBodyInput.value.trim() || '';

        if (editingNoteId) {
            const index = notes.findIndex(n => n.id === editingNoteId);
            notes[index] = { ...notes[index], title, body, timestamp: Date.now() };
        } else {
            const newNote = {
                id: Date.now(),
                title,
                body,
                timestamp: Date.now()
            };
            notes.push(newNote);
        }

        saveToStorage();
        renderNotes();
        closeNoteModal();
    };

    const deleteNote = (id) => {
        if (confirm('Delete this note?')) {
            notes = notes.filter(n => n.id !== id);
            saveToStorage();
            renderNotes();
        }
    };

    // Event Listeners
    fab.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', closeNoteModal);
    saveNoteBtn.addEventListener('click', saveNote);
    searchInput.addEventListener('input', renderNotes);
    sortSelect.addEventListener('change', renderNotes);

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) closeNoteModal();
    });

    renderNotes();
});