document.addEventListener('DOMContentLoaded', function () {
    let isEditMode = false;
    let currentOfficeId = null;

    // Function to load offices for display
    function loadOffices() {
        fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices')
            .then(response => response.json())
            .then(data => {
                const tbody = document.getElementById('officesList');
                tbody.innerHTML = ''; // Clear the table body
                data.forEach(office => {
                    const row = `
                        <tr>
                            <td>${office.office_id}</td>
                            <td>${office.office_name}</td>
                            <td>${office.office_email}</td>
                            <td>${office.contact_first_name}</td>
                            <td>${office.contact_last_name}</td>
                            <td>${office.contact_phone_number}</td>
                            <td>
                                <button class="btn btn-info" onclick="editOffice('${office.office_id}')">Edit</button>
                                <button class="btn btn-danger" onclick="deleteOffice('${office.office_id}')">Delete</button>
                            </td>
                        </tr>`;
                    tbody.insertAdjacentHTML('beforeend', row);
                });
            });
    }

    // Load offices when the page is loaded
    loadOffices();

    // Handle form submission
    document.getElementById('officeForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const officeName = document.getElementById('officeName').value;
        const officeEmail = document.getElementById('officeEmail').value;
        const contactFirstName = document.getElementById('contactFirstName').value;
        const contactLastName = document.getElementById('contactLastName').value;
        const contactPhoneNumber = document.getElementById('contactPhoneNumber').value;

        if (isEditMode && currentOfficeId) {
            // Update existing office
            fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices/${currentOfficeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    office_name: officeName,
                    office_email: officeEmail,
                    contact_first_name: contactFirstName,
                    contact_last_name: contactLastName,
                    contact_phone_number: contactPhoneNumber
                })
            }).then(() => {
                resetForm();
                loadOffices();
            });
        } else {
            // Add new office
            fetch('https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    office_name: officeName,
                    office_email: officeEmail,
                    contact_first_name: contactFirstName,
                    contact_last_name: contactLastName,
                    contact_phone_number: contactPhoneNumber
                })
            }).then(() => {
                resetForm();
                loadOffices();
            });
        }
    });

    // Edit office
    window.editOffice = function (officeId) {
        fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices/${officeId}`)
            .then(response => response.json())
            .then(office => {
                document.getElementById('officeName').value = office.office_name;
                document.getElementById('officeEmail').value = office.office_email;
                document.getElementById('contactFirstName').value = office.contact_first_name;
                document.getElementById('contactLastName').value = office.contact_last_name;
                document.getElementById('contactPhoneNumber').value = office.contact_phone_number;

                currentOfficeId = officeId;
                isEditMode = true;
                document.getElementById('submitButton').textContent = 'Update';
            });
    };

    // Delete office
    window.deleteOffice = function (officeId) {
        if (confirm('Are you sure you want to delete this office?')) {
            fetch(`https://plankton-app-2-9k8uf.ondigitalocean.app/api/vr_offices/${officeId}`, {
                method: 'DELETE'
            }).then(() => {
                loadOffices();
            });
        }
    };

    // Reset the form
    function resetForm() {
        document.getElementById('officeForm').reset();
        isEditMode = false;
        currentOfficeId = null;
        document.getElementById('submitButton').textContent = 'Add';
    }
});
