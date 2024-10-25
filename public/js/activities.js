document.addEventListener('DOMContentLoaded', async () => {
    const activityForm = document.getElementById('activityForm');
    const participantIdInput = document.getElementById('participant_id');
    const authNumberInputContainer = document.getElementById('auth_number_container'); // For dynamic content
    const categorySelect = document.getElementById('categorySelect'); // Category dropdown

    // Load categories into the category dropdown
    async function loadCategories() {
        try {
            const response = await fetch('/api/activity_types'); // Adjust if needed
            if (!response.ok) throw new Error('Failed to fetch categories');

            const categories = await response.json();
            categorySelect.innerHTML = '<option value="">Select a category</option>'; // Default option

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.type_id; // Assuming `type_id` is the ID
                option.textContent = category.type_name; // Display category name
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // Load categories when page loads
    await loadCategories();

    // Fetch participants for the participant dropdown
    try {
        const response = await fetch('/api/participants'); // Adjust if needed
        if (!response.ok) throw new Error('Failed to fetch participants');
        
        const participants = await response.json();
        participants.forEach(participant => {
            const option = document.createElement('option');
            option.value = participant.participant_id;
            option.textContent = `${participant.first_name} ${participant.last_name} (ID: ${participant.participant_id})`;
            participantIdInput.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching participants:', error);
    }

    // Event listener for participant ID change
    participantIdInput.addEventListener('change', async () => {
        const participantId = participantIdInput.value;
        authNumberInputContainer.innerHTML = ''; // Clear previous content

        if (participantId) {
            try {
                const response = await fetch(`/api/authorizations/participant/${participantId}`);
                if (!response.ok) throw new Error('Failed to fetch authorizations');
                const authorizations = await response.json();

                if (authorizations.length > 1) {
                    let authOptions = '<option value="">Select Authorization</option>';
                    authorizations.forEach(auth => {
                        authOptions += `<option value="${auth.auth_number}">${auth.auth_number}</option>`;
                    });
                    authNumberInputContainer.innerHTML = `<select id="auth_number" name="auth_number" class="form-control" required>${authOptions}</select>`;
                } else if (authorizations.length === 1) {
                    authNumberInputContainer.innerHTML = `<input type="text" id="auth_number" name="auth_number" class="form-control" value="${authorizations[0].auth_number}" readonly required>`;
                } else {
                    authNumberInputContainer.innerHTML = `<p class="text-danger">No authorizations found for this participant.</p>`;
                }
            } catch (error) {
                console.error('Error fetching authorizations:', error);
                authNumberInputContainer.innerHTML = `<p class="text-danger">Error fetching authorizations. Please try again later.</p>`;
            }
        } else {
            authNumberInputContainer.innerHTML = `<input type="text" id="auth_number" name="auth_number" class="form-control" value="" required>`;
        }
    });

    // Form submission handler
    activityForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(activityForm);
        const activityData = Object.fromEntries(formData.entries());

        const activityId = activityData.activity_id;
        const method = activityId ? 'PUT' : 'POST';
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
            // Reset the form or redirect as needed
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('An error occurred while saving the activity.');
        }
    });
});
