document.addEventListener('DOMContentLoaded', function() {
    let isEditMode = false;
    let currentAuthNumber = null;

    // Function to load participants for the dropdown
    function loadParticipants() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants')
            .then(response => response.json())
            .then(data => {
                const participantSelect = document.getElementById('participant');
                data.forEach(participant => {
                    const option = document.createElement('option');
                    option.value = participant.participant_id; // Store participant_id
                    option.textContent = `${participant.first_name} ${participant.last_name}`;
                    participantSelect.appendChild(option);
                });
            });
    }

    // Function to load offices for the dropdown (show office_id and office_name)
    function loadOffices() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices')
            .then(response => response.json())
            .then(data => {
                const officeSelect = document.getElementById('office');
                data.forEach(office => {
                    const option = document.createElement('option');
                    option.value = office.office_id; // Store office_id
                    option.textContent = `${office.office_id} - ${office.office_name}`; // Show office_id and office_name
                    officeSelect.appendChild(option);
                });
            });
    }

    function loadAuthorizations() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth')
            .then(response => response.json())
            .then(data => {
                // Check if data is an array
                if (Array.isArray(data)) {
                    const tbody = document.getElementById('authorizationsList');
                    tbody.innerHTML = ''; // Clear the table body
    
                    // For each authorization, fetch the participant details and then populate the row
                    data.forEach(auth => {
                        fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/participants/${auth.participant_id}`)
                            .then(response => response.json())
                            .then(participant => {
                                const row = `
                                    <tr>
                                        <td>
                                            <button class="btn btn-info" onclick="editAuthorization('${auth.auth_number}')">Edit</button>
                                        </td>
                                        <td>${auth.auth_number}</td>
                                        <td>${new Date(auth.auth_begin_date).toLocaleDateString()}</td>
                                        <td>${new Date(auth.auth_end_date).toLocaleDateString()}</td>
                                        <td>${auth.auth_rate}</td>
                                        <td>${auth.auth_billable_hours}</td>
                                        <td>${auth.auth_remaining_billable_hours}</td>
                                        <td>${auth.participant_id}</td>
                                        <td>${participant.first_name} ${participant.last_name}</td>
                                        <td>${auth.office_name}</td>
                                        <td>${auth.office_email}</td>
                                        <td>${auth.contact_first_name}</td>
                                        <td>${auth.contact_last_name}</td>
                                        <td>${auth.contact_phone_number}</td>
                                        
                                    </tr>`;
                                tbody.insertAdjacentHTML('beforeend', row);
                            });
                    });
                } else {
                    console.error('Data is not an array', data);
                }
            })
            .catch(error => {
                console.error('Error fetching authorizations:', error);
            });
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
                });
        } else {
            // Clear the office details if no office is selected
            document.getElementById('officeName').value = '';
            document.getElementById('officeEmail').value = '';
            document.getElementById('contactFirstName').value = '';
            document.getElementById('contactLastName').value = '';
            document.getElementById('contactPhoneNumber').value = '';
        }
    });

    // Load participants, offices, and authorizations when the page is loaded
    loadParticipants();
    loadOffices();
    loadAuthorizations();

    // Handle form submission
    document.getElementById('authForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const authNumber = document.getElementById('authNumber').value;
        const authBeginDate = document.getElementById('authBeginDate').value;
        const authEndDate = document.getElementById('authEndDate').value;
        const authRate = document.getElementById('authRate').value;
        const authBillableHours = document.getElementById('authBillableHours').value;
        const authRemainingBillableHours = document.getElementById('authRemainingBillableHours').value;
        const participantId = document.getElementById('participant').value;
        const officeName = document.getElementById('officeName').value;
        const officeEmail = document.getElementById('officeEmail').value;
        const contactFirstName = document.getElementById('contactFirstName').value;
        const contactLastName = document.getElementById('contactLastName').value;
        const contactPhoneNumber = document.getElementById('contactPhoneNumber').value;

        if (isEditMode && currentAuthNumber) {
            // Update existing authorization
            fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth/${currentAuthNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    auth_number: authNumber,
                    auth_begin_date: authBeginDate,
                    auth_end_date: authEndDate,
                    auth_rate: authRate,
                    auth_billable_hours: authBillableHours,
                    auth_remaining_billable_hours: authRemainingBillableHours,
                    participant_id: participantId,
                    office_name: officeName,
                    office_email: officeEmail,
                    contact_first_name: contactFirstName,
                    contact_last_name: contactLastName,
                    contact_phone_number: contactPhoneNumber
                })
            }).then(() => {
                resetForm();
                loadAuthorizations();
            });
        } else {
            // Add new authorization
            fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    auth_number: authNumber,
                    auth_begin_date: authBeginDate,
                    auth_end_date: authEndDate,
                    auth_rate: authRate,
                    auth_billable_hours: authBillableHours,
                    auth_remaining_billable_hours: authRemainingBillableHours,
                    participant_id: participantId,
                    office_name: officeName,
                    office_email: officeEmail,
                    contact_first_name: contactFirstName,
                    contact_last_name: contactLastName,
                    contact_phone_number: contactPhoneNumber
                })
            }).then(() => {
                resetForm();
                loadAuthorizations();
            });
        }
    });

    // Edit authorization
    window.editAuthorization = function(authNumber) {
        fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth/${authNumber}`)
            .then(response => response.json())
            .then(auth => {
                document.getElementById('authNumber').value = auth.auth_number;
                const followUpDateBegin = auth.authBeginDate.split('T')[0]; // Extract just the date part (YYYY-MM-DD)
                document.getElementById('authBeginDate').value = followUpDateBegin;
                const followUpDateEnd = auth.authBeginDate.split('T')[0]; // Extract just the date part (YYYY-MM-DD)
                document.getElementById('authEndDate').value = followUpDateEnd;
                document.getElementById('authRate').value = auth.auth_rate;
                document.getElementById('authBillableHours').value = auth.auth_billable_hours;
                document.getElementById('authRemainingBillableHours').value = auth.auth_remaining_billable_hours;
                document.getElementById('participant').value = auth.participant_id;
                document.getElementById('officeName').value = auth.office_name;
                document.getElementById('officeEmail').value = auth.office_email;
                document.getElementById('contactFirstName').value = auth.contact_first_name;
                document.getElementById('contactLastName').value = auth.contact_last_name;
                document.getElementById('contactPhoneNumber').value = auth.contact_phone_number;

                currentAuthNumber = authNumber;
                isEditMode = true;
                document.getElementById('submitButton').textContent = 'Update';
            });
    };

    // Reset the form
    function resetForm() {
        document.getElementById('authForm').reset();
        isEditMode = false;
        currentAuthNumber = null;
        document.getElementById('submitButton').textContent = 'Add';
    }
});
