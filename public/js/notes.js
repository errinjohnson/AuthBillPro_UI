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
        const editUrl = document.getElementById('editUrl').value;  // Store edit URL in hidden input
        if (noteId && editUrl) {
            // Update note using hypermedia control
            updateNote(editUrl, noteData);
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
            if (Array.isArray(data)) {
                const tableBody = document.getElementById('tableBody');
                tableBody.innerHTML = '';  // Clear the table

                // Helper function to map month number to month name
                const getMonthName = (monthNumber) => {
                    const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    return monthNames[monthNumber - 1];
                };

                // Helper function to map year, month, and day to a weekday
                const getWeekdayName = (year, month, day) => {
                    const daysOfWeek = [
                        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                    ];
                    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const date = new Date(dateString);
                    return daysOfWeek[date.getUTCDay()];
                };

                // Loop through each note and populate the table
                data.forEach(note => {
                    const followUpDate = note.follow_up.split('T')[0]; // Remove time part if present
                    const [year, month, day] = followUpDate.split('-');
                    const monthName = getMonthName(Number(month));
                    const weekdayName = getWeekdayName(Number(year), Number(month), Number(day));
                    const formattedDate = `${weekdayName}, ${monthName} ${Number(day)}, ${year}`;

                    const row = `
                        <tr>
                            <td>${note.note_id}</td>
                            <td>${note.name}</td>
                            <td class="text-wrap" style="max-width: 300px;min-width: 150px;">${note.note}</td>
                            <td>${formattedDate}</td>
                            <td>${note.status}</td>
                            <td>
                                <button class="btn btn-info" onclick="editNote('${note._links.self.href}', '${note._links.edit.href}')">Edit</button>
                                <button class="btn btn-danger" onclick="deleteNote('${note._links.delete.href}')">Delete</button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', row);
                });
            } else {
                console.error('Data is not an array:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching notes:', error);
        });
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

function updateNote(editUrl, noteData) {
    // Send a PUT request to update an existing note using hypermedia control
    fetch(editUrl, {
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

function editNote(selfUrl, editUrl) {
    // Fetch note data and populate the form for editing
    fetch(selfUrl)
    .then(response => response.json())
    .then(note => {
        document.getElementById('note_id').value = note.note_id;
        document.getElementById('note').value = note.note;

        const followUpDate = note.follow_up.split('T')[0]; // Extract just the date part
        document.getElementById('follow_up').value = followUpDate;

        document.getElementById('status').value = note.status;
        document.getElementById('name').value = note.name;

        document.getElementById('editUrl').value = editUrl; // Store edit URL for update
        document.getElementById('submitButton').textContent = 'Update Note';

        document.getElementById('note').focus();
    });
}

function deleteNote(deleteUrl) {
    // Send a DELETE request using hypermedia control
    fetch(deleteUrl, {
        method: 'DELETE',
    })
    .then(() => {
        fetchNotes();  // Refresh the notes list
    });
}

function clearForm() {
    document.getElementById('noteForm').reset();
    document.getElementById('note_id').value = '';
    document.getElementById('editUrl').value = '';  // Clear stored edit URL
    document.getElementById('submitButton').textContent = 'Add Note';
}
