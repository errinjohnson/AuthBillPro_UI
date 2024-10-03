// Function to add a new participant using the API
function addParticipant(participant) {
    fetch('/api/participants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(participant)
    })
    .then(response => response.json())
    .then(data => {
        if (data.participant_id) { // Check if participant ID is returned from server
            participant.participant_id = data.participant_id; // Assign returned ID to participant
            addParticipantToTable(participant); // Add participant to the table
            resetForm(); // Reset the form after adding
        }
        console.log('Participant added:', data);
    })
    .catch(error => console.error('Error adding participant:', error));
}

// Fetch all participants from the API and display them
function fetchParticipants() {
    fetch('/api/participants')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(participants => {
        participants.forEach(participant => {
            addParticipantToTable(participant);
        });
    })
    .catch(error => console.error('Error fetching participants:', error));
}

// Function to add a participant to the table
function addParticipantToTable(participant) {
    const participantTableBody = document.getElementById('participantTableBody');

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <button onclick="editParticipant(${participant.participant_id});">Edit</button>
        </td>
        <td>${participant.participant_id}</td>
        <td>${participant.email}</td>
        <td>${participant.first_name}</td>
        <td>${participant.last_name}</td>
        <td>${participant.phone}</td>
        <td>${participant.registration}</td>
    `;
    participantTableBody.appendChild(row);
}

// Function to handle editing a participant
function editParticipant(participantId) {
    // Fetch the participant details to populate the form
    fetch(`/api/participants/${participantId}`)
        .then(response => response.json())
        .then(participant => {
            // Populate the form fields with the participant's current data
            document.getElementById('participant_id').value = participant.participant_id;
            document.getElementById('email').value = participant.email;
            document.getElementById('first_name').value = participant.first_name;
            document.getElementById('last_name').value = participant.last_name;
            document.getElementById('phone').value = participant.phone;
            document.getElementById('registration').value = participant.registration;

            // Change button text to "Update"
            document.getElementById('formSubmitButton').textContent = 'Update';

            // Optionally, scroll into view or display a message
        })
        .catch(error => console.error('Error fetching participant for edit:', error));
}

// Function to reset the form
function resetForm() {
    document.getElementById('participant_id').value = ''; // Clear hidden ID
    document.getElementById('email').value = '';
    document.getElementById('first_name').value = '';
    document.getElementById('last_name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('registration').value = '';
    document.getElementById('formSubmitButton').textContent = 'Add Participant'; // Reset button text
}

// Function to update a participant using the API
function updateParticipant(participantId, participant) {
    fetch(`/api/participants/${participantId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(participant)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Participant updated:', data);
        // Refresh the participants list or update the UI table directly
        refreshParticipantList(); // Update this function accordingly
        resetForm(); // Reset the form after update
    })
    .catch(error => console.error('Error updating participant:', error));
}

// Function to delete a participant using the API
function deleteParticipant(participantId) {
    fetch(`/api/participants/${participantId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Participant deleted:', data);
        refreshParticipantList(); // Refresh the list
    })
    .catch(error => console.error('Error deleting participant:', error));
}

// Event Listener to Fetch Participants on Page Load
document.addEventListener('DOMContentLoaded', fetchParticipants);
