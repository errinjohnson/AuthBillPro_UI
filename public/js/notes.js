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
            // Check if data is an array
            if (Array.isArray(data)) {
                const tableBody = document.getElementById('tableBody');
                tableBody.innerHTML = '';  // Clear the table

                // Helper function to map month number to month name
                const getMonthName = (monthNumber) => {
                    const monthNames = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];
                    return monthNames[monthNumber - 1]; // Adjusting for 0-indexed array
                };

                // Helper function to map year, month, and day to a weekday
                const getWeekdayName = (year, month, day) => {
                    const daysOfWeek = [
                        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                    ];
                    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const date = new Date(dateString); // Use this just to get the correct weekday
                    return daysOfWeek[date.getUTCDay()]; // Use getUTCDay to avoid timezone interference
                };

                // Loop through each note and populate the table
                data.forEach(note => {
                    // Assuming the follow_up date is in YYYY-MM-DD format (from the database)
                    const followUpDate = note.follow_up.split('T')[0]; // Remove time part if present
                    const [year, month, day] = followUpDate.split('-'); // Split the date string into year, month, day parts

                    // Get the month name and weekday
                    const monthName = getMonthName(Number(month));
                    const weekdayName = getWeekdayName(Number(year), Number(month), Number(day));

                    // Manually create the readable date string
                    const formattedDate = `${weekdayName}, ${monthName} ${Number(day)}, ${year}`;

                    // Populate the table row
                    const row = `
                        <tr>
                            <td>${note.note_id}</td>
                            <td>${note.name}</td>
                            <td class="text-wrap" style="max-width: 300px;min-width: 150px;">${note.note}</td>
                            <td>${formattedDate}</td>
                            <td>${note.status}</td>
                            <td>
                                <button class="btn btn-info" onclick="editNote(${note.note_id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteNote(${note.note_id})">Delete</button>
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

        // Format the follow-up date to YYYY-MM-DD if needed
        const followUpDate = note.follow_up.split('T')[0]; // Extract just the date part (YYYY-MM-DD)
        document.getElementById('follow_up').value = followUpDate;

        document.getElementById('status').value = note.status;
        document.getElementById('name').value = note.name;
        document.getElementById('submitButton').textContent = 'Update Note';

        // Set focus to the note field after populating the form
        document.getElementById('note').focus();
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