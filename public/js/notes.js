document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display notes from API
    fetchNotes();

    // Form submission handler
    document.getElementById('noteForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const noteData = {
            note: document.getElementById('note').value,
            follow_up: document.getElementById('follow_up').value,
            status: document.getElementById('status').value,
            name: document.getElementById('name').value,
        };

        // Check if updating or adding new note
        const noteId = document.getElementById('note_id').value;
        if (noteId) {
            // Update note
            updateNote(noteId, noteData);
        } else {
            // Add new note
            addNote(noteData);
        }
    });
});

function fetchNotes() {
    fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('tableBody');  // Correct selector
            tableBody.innerHTML = '';  // Clear table

            data.forEach(note => {
                const row = `
                    <tr>
                        <td>${note.note_id}</td>
                        <td class="text-wrap" style="max-width: 300px;min-width: 150px;">${note.note}</td>
                        <td>${note.follow_up}</td>
                        <td>${note.status}</td>
                        <td>${note.name}</td>
                        <td>
                            <button class="btn btn-info" onclick="editNote(${note.note_id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteNote(${note.note_id})">Delete</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching notes:', error));
}


function addNote(noteData) {
    // Send a POST request to add a new note
    fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
    })
    .then(response => response.json())
    .then(data => {
        fetchNotes();  // Refresh the notes list
        clearForm();   // Clear the form for a new entry
    });
}

function updateNote(noteId, noteData) {
    // Send a PUT request to update an existing note
    fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
    })
    .then(response => response.json())
    .then(data => {
        fetchNotes();  // Refresh the notes list
        clearForm();   // Clear the form for new entry mode
    });
}

function editNote(noteId) {
    // Populate the form with the selected note data for editing
    fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes/${noteId}`)
    .then(response => response.json())
    .then(note => {
        document.getElementById('note_id').value = note.note_id;
        document.getElementById('note').value = note.note;
        document.getElementById('follow_up').value = note.follow_up;
        document.getElementById('status').value = note.status;
        document.getElementById('name').value = note.name;
        document.getElementById('submitButton').textContent = 'Update Note';
    });
}

function deleteNote(noteId) {
    // Send a DELETE request to remove the note
    fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes/${noteId}`, {
        method: 'DELETE',
    })
    .then(() => {
        fetchNotes();  // Refresh the notes list
    });
}

function clearForm() {
    document.getElementById('noteForm').reset();
    document.getElementById('note_id').value = '';
    document.getElementById('submitButton').textContent = 'Add Note';
}