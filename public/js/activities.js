document.addEventListener('DOMContentLoaded', () => {
    const activityForm = document.getElementById('activityForm');
    const participantIdInput = document.getElementById('participant_id');
    const authNumberInput = document.getElementById('auth_number');
    
    // Event listener for when the participant ID is changed
    participantIdInput.addEventListener('change', async () => {
        const participantId = participantIdInput.value;

        if (participantId) {
            // Fetch authorizations for the selected participant
            try {
                const response = await fetch(`/api/authorizations/${participantId}`);
                if (!response.ok) throw new Error('Failed to fetch authorizations');
                const authorizations = await response.json();

                // If participant has multiple authorizations, let the user choose
                if (authorizations.length > 1) {
                    let authOptions = '';
                    authorizations.forEach(auth => {
                        authOptions += `<option value="${auth.auth_number}">${auth.auth_number}</option>`;
                    });

                    authNumberInput.innerHTML = `<select class="form-control">${authOptions}</select>`;
                } else if (authorizations.length === 1) {
                    // Automatically fill in if only one authorization exists
                    authNumberInput.value = authorizations[0].auth_number;
                } else {
                    authNumberInput.value = ''; // No authorizations found
                }
            } catch (error) {
                console.error('Error fetching authorizations:', error);
            }
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
