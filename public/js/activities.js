document.addEventListener('DOMContentLoaded', () => {
    const activityForm = document.getElementById('activityForm');
    const participantIdInput = document.getElementById('participant_id');
    const authNumberInputContainer = document.getElementById('auth_number'); // Container to hold input or select

    // Event listener for when the participant ID is changed
    participantIdInput.addEventListener('change', async () => {
        const participantId = participantIdInput.value;

        if (participantId) {
            // Fetch authorizations for the selected participant
            try {
                const response = await fetch(`/api/authorizations/participant/${participantId}`);
                if (!response.ok) throw new Error('Failed to fetch authorizations');
                const authorizations = await response.json();

                // If participant has multiple authorizations, render a dropdown (select)
                if (authorizations.length > 1) {
                    let authOptions = '';
                    authorizations.forEach(auth => {
                        authOptions += `<option value="${auth.auth_number}">${auth.auth_number}</option>`;
                    });

                    // Replace the current input with a select dropdown
                    authNumberInputContainer.innerHTML = `<select id="auth_number" name="auth_number" class="form-control" required>${authOptions}</select>`;
                } else if (authorizations.length === 1) {
                    // If only one authorization exists, replace with a single input field
                    authNumberInputContainer.innerHTML = `<input type="text" id="auth_number" name="auth_number" class="form-control" value="${authorizations[0].auth_number}" readonly required>`;
                } else {
                    // No authorizations found, clear the input field
                    authNumberInputContainer.innerHTML = `<input type="text" id="auth_number" name="auth_number" class="form-control" value="" required>`;
                }
            } catch (error) {
                console.error('Error fetching authorizations:', error);
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

// Function to fetch all activities (for displaying in a table, for example)
async function fetchActivities() {
    try {
        const response = await fetch('/api/activities');
        if (!response.ok) throw new Error('Failed to fetch activities');
        const activities = await response.json();
        // Code to display activities on the page
    } catch (error) {
        console.error('Error fetching activities:', error);
    }
}
