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
        updateParticipantRow(participantId, participant); // Update participant row in table
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
