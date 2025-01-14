document.addEventListener('DOMContentLoaded', async () => {
    const participantSelect = document.getElementById('participantSelect');
    const invoiceTableBody = document.getElementById('invoiceTableBody');

    // Load participants into the dropdown
    async function loadParticipants() {
        try {
            const response = await fetch('/api/participants');
            if (!response.ok) throw new Error('Failed to fetch participants');

            const participants = await response.json();
            participantSelect.innerHTML = '<option value="">Select a participant</option>';
            participants.forEach(participant => {
                const option = document.createElement('option');
                option.value = participant.participant_id;
                option.textContent = `${participant.first_name} ${participant.last_name} (ID: ${participant.participant_id})`;
                participantSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    }

    // Load invoices for a selected participant
    async function loadInvoices(participantId) {
        invoiceTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

        try {
            const response = await fetch(`/api/invoices/participant/${participantId}`);
            if (!response.ok) throw new Error('Failed to fetch invoices');

            const invoices = await response.json();
            if (invoices.length === 0) {
                invoiceTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No invoices found for this participant.</td></tr>';
                return;
            }

            invoiceTableBody.innerHTML = '';
            invoices.forEach(invoice => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invoice.activity_id}</td>
                    <td>${invoice.activity_date}</td>
                    <td>${invoice.actType_name}</td>
                    <td>${invoice.actBillable_hours}</td>
                    <td>${invoice.auth_rate}</td>
                    <td>${(invoice.actBillable_hours * invoice.auth_rate).toFixed(2)}</td>
                    <td>${invoice.participant_name}</td>
                `;
                invoiceTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading invoices:', error);
            invoiceTableBody.innerHTML = '<tr><td colspan="7" class="text-danger text-center">Error loading invoices. Please try again.</td></tr>';
        }
    }

    // Event listener for participant selection change
    participantSelect.addEventListener('change', () => {
        const participantId = participantSelect.value;
        if (participantId) {
            loadInvoices(participantId);
        } else {
            invoiceTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Select a participant to view invoices.</td></tr>';
        }
    });

    // Initialize participants dropdown
    await loadParticipants();
});
