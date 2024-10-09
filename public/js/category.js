const apiUrl = 'https://plankton-app-2-9k8uf.ondigitalocean.app/api/activity_types';

        // Handle form submission to add a new category
        document.getElementById('categoryForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const typeName = document.getElementById('type_name').value;

            // POST request to add a category
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type_name: typeName })
            })
            .then(response => response.json())
            .then(data => {
                alert('Category added successfully');
                loadCategories();  // Reload the categories after adding
                document.getElementById('categoryForm').reset(); // Clear the form
            })
            .catch(error => console.error('Error adding category:', error));
        });

        // Function to load categories from the API
        function loadCategories() {
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    const tableBody = document.getElementById('categoryTableBody');
                    tableBody.innerHTML = ''; // Clear existing rows

                    data.forEach(category => {
                        const row = `<tr>
                            <td>${category.type_id}</td>
                            <td>${category.type_name}</td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    });
                })
                .catch(error => console.error('Error loading categories:', error));
        }

        // Load categories when the page loads
        window.onload = loadCategories;