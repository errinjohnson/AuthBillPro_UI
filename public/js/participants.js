document.getElementById('phone').addEventListener('input', function(e) {
    let input = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (input.length <= 3) {
        e.target.value = `(${input}`;
    } else if (input.length <= 6) {
        e.target.value = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    } else {
        e.target.value = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
    }
});


// Function to add a new participant using the API
function addParticipant(participant) {
    fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants', { // Use full API URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(participant)
    })
    .then(response => response.json())
    .then(data => {
        if (data.participant_id) { 
            participant.participant_id = data.participant_id; 
            addParticipantToTable(participant); 
            resetForm(); // Reset the form after adding
        }
        console.log('Participant added:', data);
    })
    .catch(error => console.error('Error adding participant:', error));
}

// Fetch all participants from the API and display them
document.addEventListener('DOMContentLoaded', function() {
    function fetchParticipants() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // Check if data is an array
                if (Array.isArray(data)) {
                    const tableBody = document.getElementById('participantTableBody'); // Updated selector
                    if (tableBody) {
                        tableBody.innerHTML = ''; // Clear table

                        // Loop through each participant and add them to the table
                        data.forEach(participant => {
                            addParticipantToTable(participant);
                        });
                    } else {
                        console.error('Element with id "participantTableBody" not found in the DOM.');
                    }
                } else {
                    console.error('Data is not an array:', data);
                }
            })
            .catch(error => console.error('Error fetching participants:', error));
    }

    // Call the function to fetch participants after DOM is loaded
    fetchParticipants();
});


// Function to add a participant to the table
function addParticipantToTable(participant) {
    const participantTableBody = document.getElementById('participantTableBody');

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <button class="btn-warning btn-warning:hover" onclick="editParticipant(${participant.participant_id});">Edit</button>
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
function addParticipantToTable(participant) {
    const participantTableBody = document.getElementById('participantTableBody');

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <button class="btn btn-warning" onclick="editParticipant(${participant.participant_id});">Edit</button>
        </td> 
        <td>${participant.participant_id}</td>
        <td>${participant.email}</td>
        <td>${participant.first_name}</td>
        <td>${participant.last_name}</td>
        <td>${participant.phone}</td>
        <td>${new Date(participant.registration).toLocaleDateString()}</td>
    `;
    participantTableBody.appendChild(row);
}

// Function to reset the form
function resetForm() {
    document.getElementById('participant_id').value = '';
    document.getElementById('email').value = '';
    document.getElementById('first_name').value = '';
    document.getElementById('last_name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('registration').value = '';
    document.getElementById('formSubmitButton').textContent = 'Add Participant';
}
function refreshParticipantList() {
    // Clear the current participants in the table
    const participantTableBody = document.getElementById('participantTableBody');
    participantTableBody.innerHTML = ''; // Clear the table
    
    // Fetch the updated list of participants
    fetchParticipants(); // This will re-fetch and populate the table with updated data
}

// Function to update a participant using the API
function updateParticipant(participantId) {
    const participant = {
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        phone: document.getElementById('phone').value,
        registration: document.getElementById('registration').value
    };
    
    console.log("Participant Data being sent for update:", participant); // Log the data
    
    fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants/${participantId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(participant)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error updating participant: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Participant updated:', data);
        refreshParticipantList(); // Refresh participant list
        resetForm(); // Reset the form after update
    })
    .catch(error => console.error('Error updating participant:', error));
}

document.getElementById('participantForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting the default way
    const participantId = document.getElementById('participant_id').value;
    
    if (participantId) {
        // Edit mode: Call update function
        updateParticipant(participantId); 
    } else {
        // Add mode: Call add function
        addParticipant({
            email: document.getElementById('email').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            phone: document.getElementById('phone').value,
            registration: document.getElementById('registration').value
        });
    }
});


// Function to delete a participant using the API
function deleteParticipant(participantId) {
    fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants/${participantId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Participant deleted:', data);
        refreshParticipantList(); // Refresh the list
    })
    .catch(error => console.error('Error deleting participant:', error));
}

