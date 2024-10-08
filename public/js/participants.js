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

// Function to refresh the participant list
function refreshParticipantList() {
    const participantTableBody = document.getElementById('participantTableBody');
    participantTableBody.innerHTML = ''; // Clear the table

    // Re-fetch the updated participant list
    fetchParticipants(); // This will re-populate the table with updated data
}

// Call fetchParticipants when DOM is 
document.addEventListener('DOMContentLoaded', function() {
    fetchParticipants();
});

function editParticipant(participantId) {
    // Fetch the participant data from the API to get the current details
    fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants/${participantId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error fetching participant: ' + response.statusText);
        }
        return response.json();
    })
    .then(participant => {
        // Populate the form with the participant data for editing
        document.getElementById('participant_id').value = participant.participant_id;
        document.getElementById('email').value = participant.email;
        document.getElementById('first_name').value = participant.first_name;
        document.getElementById('last_name').value = participant.last_name;
        document.getElementById('phone').value = participant.phone;
        document.getElementById('registration').value = participant.registration.split('T')[0]; // Adjust date format if needed

        // Change the submit button to say "Update"
        document.getElementById('formSubmitButton').textContent = 'Update';
    })
    .catch(error => console.error('Error fetching participant data:', error));
}


// Function to add a participant to the table
function addParticipantToTable(participant) {
    const participantTableBody = document.getElementById('participantTableBody');
    
    const registrationDate = new Date(participant.registration);
    const formattedDate = `${registrationDate.getFullYear()}-${String(registrationDate.getMonth() + 1).padStart(2, '0')}-${String(registrationDate.getDate()).padStart(2, '0')}`;

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
        <td>${formattedDate}</td>
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

