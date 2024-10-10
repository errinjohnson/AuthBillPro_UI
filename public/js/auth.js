document.addEventListener('DOMContentLoaded', function() {
    let isEditMode = false;
    let currentAuthLinks = {};  // Store links for the current authorization

    // Function to load authorizations with hypermedia controls
    function loadAuthorizations() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('authorizationsList');
                tbody.innerHTML = ''; // Clear the table body

                data.forEach(auth => {
                    // Extract dates and format as MM/DD/YYYY
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

    // Edit authorization
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

                currentAuthLinks = { editUrl };  // Store the edit link
                isEditMode = true;
                document.getElementById('submitButton').textContent = 'Update';
            });
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
            }).then(() => {
                resetForm();
                loadAuthorizations();
            });
        } else {
            // Add new authorization
            fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authData)
            }).then(() => {
                resetForm();
                loadAuthorizations();
            });
        }
    });

    // Reset the form
    function resetForm() {
        document.getElementById('authForm').reset();
        isEditMode = false;
        currentAuthLinks = {};
        document.getElementById('submitButton').textContent = 'Add';
    }

    // Load participants, offices, and authorizations when the page loads
    loadAuthorizations();
});
