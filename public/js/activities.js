document.addEventListener('DOMContentLoaded', async () => {
    const activityForm = document.getElementById('activityForm');
    const participantIdInput = document.getElementById('participant_id');
    const authNumberInputContainer = document.getElementById('auth_number_container'); // Use the container for dynamic content

    // Fetch participants to populate the dropdown
    try {
        const response = await fetch('/api/participants');
        if (!response.ok) throw new Error('Failed to fetch participants');
        
        const participants = await response.json();
        participants.forEach(participant => {
            const option = document.createElement('option');
            option.value = participant.participant_id;
            // Display both participant name and ID for clarity
            option.textContent = `${participant.participant_name} (ID: ${participant.participant_id})`;
            participantIdInput.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching participants:', error);
    }

    // Event listener for when the participant ID is changed
    participantIdInput.addEventListener('change', async () => {
        const participantId = participantIdInput.value;

        // Clear any previous content inside authNumberInputContainer
        authNumberInputContainer.innerHTML = '';

        if (participantId) {
            // Fetch authorizations for the selected participant
            try {
                const response = await fetch(`/api/authorizations/participant/${participantId}`);
                if (!response.ok) throw new Error('Failed to fetch authorizations');
                const authorizations = await response.json();

                // If participant has multiple authorizations, render a dropdown (select)
                if (authorizations.length > 1) {
                    let authOptions = '<option value="">Select Authorization</option>';
                    authorizations.forEach(auth => {
                        authOptions += `<option value="${auth.auth_number}">${auth.auth_number}</option>`;
                    });

                    // Replace the current container content with a select dropdown
                    authNumberInputContainer.innerHTML = `<select id="auth_number" name="auth_number" class="form-control" required>${authOptions}</select>`;
                } else if (authorizations.length === 1) {
                    // If only one authorization exists, replace with a single input field
                    authNumberInputContainer.innerHTML = `<input type="text" id="auth_number" name="auth_number" class="form-control" value="${authorizations[0].auth_number}" readonly required>`;
                } else {
                    // No authorizations found, display a message in the container
                    authNumberInputContainer.innerHTML = `<p class="text-danger">No authorizations found for this participant.</p>`;
                }
            } catch (error) {
                console.error('Error fetching authorizations:', error);
                authNumberInputContainer.innerHTML = `<p class="text-danger">Error fetching authorizations. Please try again later.</p>`;
            }
        } else {
            // Reset auth number input if no participant ID is selected
            authNumberInputContainer.innerHTML = `<input type="text" id="auth_number" name="auth_number" class="form-control" value="" required>`;
        }
    });

    // Form submission handler
    activityForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Gather form data
        const formData = new FormData(activityForm);
        const activityData = Object.fromEntries(formData.entries());

        const activityId = activityData.activity_id; // Grab the activity ID for PUT or POST
        const method = activityId ? 'PUT' : 'POST'; // Determine method based on if it's a new activity or update
        const url = activityId ? `/api/activities/${activityId}` : '/api/activities';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityData),
            });

            if (!response.ok) throw new Error('Failed to save activity');
            const message = activityId ? 'Activity updated successfully' : 'Activity added successfully';
            alert(message);
            // Optionally, reset the form or redirect
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('An error occurred while saving the activity.');
        }
    });
});
