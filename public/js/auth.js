document.getElementById('contactPhoneNumber').addEventListener('input', function(e) {
    let input = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (input.length <= 3) {
        e.target.value = `(${input}`;
    } else if (input.length <= 6) {
        e.target.value = `(${input.slice(0, 3)}) ${input.slice(3)}`;
    } else {
        e.target.value = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    let isEditMode = false;
    let currentAuthLinks = {};  // Store hypermedia links for the current authorization

    // Function to load participants for the dropdown
    function loadParticipants() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants')
            .then(response => response.json())
            .then(data => {
                const participantSelect = document.getElementById('participant');
                participantSelect.innerHTML = ''; // Clear previous options
                data.forEach(participant => {
                    const option = document.createElement('option');
                    option.value = participant.participant_id; // Store participant_id
                    option.textContent = `${participant.first_name} ${participant.last_name}`;
                    participantSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching participants:', error));
    }

    // Function to load offices for the dropdown (show office_id and office_name)
    function loadOffices() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices')
            .then(response => response.json())
            .then(data => {
                const officeSelect = document.getElementById('office');
                officeSelect.innerHTML = ''; // Clear previous options
                data.forEach(office => {
                    const option = document.createElement('option');
                    option.value = office.office_id; // Store office_id
                    option.textContent = `${office.office_id} - ${office.office_name}`; // Show office_id and office_name
                    officeSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching offices:', error));
    }

    // Function to load authorizations with hypermedia controls
    function loadAuthorizations() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('authorizationsList');
                tbody.innerHTML = ''; // Clear the table body
    
                // For each authorization, fetch the participant details and then populate the row
                data.forEach(auth => {
                    // Extract just the date part and format as MM/DD/YYYY
                    const formattedBeginDate = formatDate(auth.auth_begin_date);
                    const formattedEndDate = formatDate(auth.auth_end_date);

                    const row = `
                        <tr>
                            <td>
                                <button class="btn btn-info" onclick="editAuthorization('${auth._links.self.href}', '${auth._links.edit.href}')">Edit</button>
                            </td>
                            <td>${auth.auth_number}</td>
                            <td>${formattedBeginDate}</td>
                            <td>${formattedEndDate}</td>
                            <td>${auth.auth_rate}</td>
                            <td>${auth.auth_billable_hours}</td>
                            <td>${auth.auth_remaining_billable_hours}</td>
                            <td>${auth.participant_id}</td>
                            <td>${auth.office_name}</td>
                            <td>${auth.office_email}</td>
                            <td>${auth.contact_first_name}</td>
                            <td>${auth.contact_last_name}</td>
                            <td>${auth.contact_phone_number}</td>
                        </tr>`;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
            })
            .catch(error => console.error('Error fetching authorizations:', error));
    }

    // Format date to MM/DD/YYYY
    function formatDate(dateString) {
        const [year, month, day] = dateString.split('T')[0].split('-');
        return `${month}/${day}/${year}`;
    }

    // Event listener to populate office details when an office is selected
    document.getElementById('office').addEventListener('change', function() {
        const officeId = this.value;
        if (officeId) {
            // Fetch the selected office's details
            fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices/${officeId}`)
                .then(response => response.json())
                .then(office => {
                    // Populate the office fields
                    document.getElementById('officeName').value = office.office_name;
                    document.getElementById('officeEmail').value = office.office_email;
                    document.getElementById('contactFirstName').value = office.contact_first_name;
                    document.getElementById('contactLastName').value = office.contact_last_name;
                    document.getElementById('contactPhoneNumber').value = office.contact_phone_number;
                })
                .catch(error => console.error('Error fetching office details:', error));
        } else {
            // Clear the office details if no office is selected
            document.getElementById('officeName').value = '';
            document.getElementById('officeEmail').value = '';
            document.getElementById('contactFirstName').value = '';
            document.getElementById('contactLastName').value = '';
            document.getElementById('contactPhoneNumber').value = '';
        }
    });

    // Edit authorization using hypermedia links
    window.editAuthorization = function(selfUrl, editUrl) {
        fetch(selfUrl)
            .then(response => response.json())
            .then(auth => {
                document.getElementById('authNumber').value = auth.auth_number;
                document.getElementById('authBeginDate').value = auth.auth_begin_date.split('T')[0];
                document.getElementById('authEndDate').value = auth.auth_end_date.split('T')[0];
                document.getElementById('authRate').value = auth.auth_rate;
                document.getElementById('authBillableHours').value = auth.auth_billable_hours;
                document.getElementById('authRemainingBillableHours').value = auth.auth_remaining_billable_hours;
                document.getElementById('participant').value = auth.participant_id;
                document.getElementById('officeName').value = auth.office_name;
                document.getElementById('officeEmail').value = auth.office_email;
                document.getElementById('contactFirstName').value = auth.contact_first_name;
                document.getElementById('contactLastName').value = auth.contact_last_name;
                document.getElementById('contactPhoneNumber').value = auth.contact_phone_number;

                currentAuthLinks = { editUrl };  // Store the edit link for later
                isEditMode = true;
                document.getElementById('submitButton').textContent = 'Update';
            })
            .catch(error => console.error('Error fetching authorization details:', error));
    };

    // Handle form submission
    document.getElementById('authForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const authData = {
            auth_number: document.getElementById('authNumber').value,
            auth_begin_date: document.getElementById('authBeginDate').value,
            auth_end_date: document.getElementById('authEndDate').value,
            auth_rate: document.getElementById('authRate').value,
            auth_billable_hours: document.getElementById('authBillableHours').value,
            auth_remaining_billable_hours: document.getElementById('authRemainingBillableHours').value,
            participant_id: document.getElementById('participant').value,
            office_name: document.getElementById('officeName').value,
            office_email: document.getElementById('officeEmail').value,
            contact_first_name: document.getElementById('contactFirstName').value,
            contact_last_name: document.getElementById('contactLastName').value,
            contact_phone_number: document.getElementById('contactPhoneNumber').value
        };

        if (isEditMode) {
            // Use the edit link from hypermedia controls
            fetch(currentAuthLinks.editUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authData)
            })
            .then(() => {
                resetForm();
                loadAuthorizations();
            })
            .catch(error => console.error('Error updating authorization:', error));
        } else {
            // Add new authorization
            fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authData)
            })
            .then(() => {
                resetForm();
                loadAuthorizations();
            })
            .catch(error => console.error('Error adding authorization:', error));
        }
    });

    // Reset the form
    function resetForm() {
        document.getElementById('authForm').reset();
        isEditMode = false;
        currentAuthLinks = {};  // Clear stored links
        document.getElementById('submitButton').textContent = 'Add';
    }

    // Load participants, offices, and authorizations when the page loads
    loadParticipants();
    loadOffices();
    loadAuthorizations();
});
