document.addEventListener('DOMContentLoaded', function() {
    let isEditMode = false;
    let currentAuthNumber = null;

    // Function to load authorizations from the server
    function loadAuthorizations() {
        fetch('/api/authorizations')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('authorizationsList');
                tbody.innerHTML = ''; // Clear the table body
                data.forEach(auth => {
                    const row = `
                        <tr>
                            <td>${auth.auth_number}</td>
                            <td>${auth.auth_begin_date}</td>
                            <td>${auth.auth_end_date}</td>
                            <td>${auth.auth_rate}</td>
                            <td>${auth.auth_billable_hours}</td>
                            <td>${auth.auth_remaining_billable_hours}</td>
                            <td>
                                <button class="btn btn-info" onclick="editAuthorization('${auth.auth_number}')">Edit</button>
                            </td>
                        </tr>`;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
            });
    }

    // Load authorizations when the page is loaded
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

        if (isEditMode && currentAuthNumber) {
            // Update existing authorization
            fetch(`/api/authorizations/${currentAuthNumber}`, {
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
                    auth_remaining_billable_hours: authRemainingBillableHours
                })
            }).then(() => {
                resetForm();
                loadAuthorizations();
            });
        } else {
            // Add new authorization
            fetch('/api/authorizations', {
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
                    auth_remaining_billable_hours: authRemainingBillableHours
                })
            }).then(() => {
                resetForm();
                loadAuthorizations();
            });
        }
    });

    // Edit authorization
    window.editAuthorization = function(authNumber) {
        fetch(`/api/authorizations/${authNumber}`)
            .then(response => response.json())
            .then(auth => {
                document.getElementById('authNumber').value = auth.auth_number;
                document.getElementById('authBeginDate').value = auth.auth_begin_date;
                document.getElementById('authEndDate').value = auth.auth_end_date;
                document.getElementById('authRate').value = auth.auth_rate;
                document.getElementById('authBillableHours').value = auth.auth_billable_hours;
                document.getElementById('authRemainingBillableHours').value = auth.auth_remaining_billable_hours;

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
