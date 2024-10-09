const apiUrl = 'https://plankton-app-2-9k8uf.ondigitalocean.app/api/activity_types';
        let isEditing = false;

        // Handle form submission to add or edit a category
        document.getElementById('categoryForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const typeName = document.getElementById('type_name').value;
            const typeId = document.getElementById('type_id').value; // This is hidden input for the category ID
        
            if (isEditing && typeId) {
                // PUT request to edit a category (only if typeId exists)
                fetch(`${apiUrl}/${typeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type_name: typeName })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update category');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Category updated successfully');
                    loadCategories();  // Reload the categories after editing
                    document.getElementById('categoryForm').reset(); // Clear the form
                    document.getElementById('submitBtn').innerText = 'Add Category'; // Reset button text
                    isEditing = false; // Reset the editing flag
                    document.getElementById('type_id').value = ''; // Clear hidden ID field
                })
                .catch(error => console.error('Error editing category:', error));
            } else {
                // POST request to add a category
                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type_name: typeName })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add category');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Category added successfully');
                    loadCategories();  // Reload the categories after adding
                    document.getElementById('categoryForm').reset(); // Clear the form
                })
                .catch(error => console.error('Error adding category:', error));
            }
        });
        
        // Function to handle editing a category
        function editCategory(typeId, typeName) {
            document.getElementById('type_name').value = typeName;
            document.getElementById('type_id').value = typeId; // Set the hidden input with the category ID
            document.getElementById('submitBtn').innerText = 'Update Category'; // Change button text to update
            isEditing = true;
        }
        

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
                            <td>
                                <button class="btn btn-warning btn-sm" onclick="editCategory(${category.type_id}, '${category.type_name}')">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.type_id})">Delete</button>
                            </td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    });
                })
                .catch(error => console.error('Error loading categories:', error));
        }

        // Function to handle editing a category
        function editCategory(typeId, typeName) {
            document.getElementById('type_name').value = typeName;
            document.getElementById('type_id').value = typeId;
            document.getElementById('submitBtn').innerText = 'Update Category'; // Change button text to update
            isEditing = true;
        }

        // Function to handle deleting a category
        function deleteCategory(typeId) {
            if (confirm('Are you sure you want to delete this category?')) {
                fetch(`${apiUrl}/${typeId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        alert('Category deleted successfully');
                        loadCategories(); // Reload the categories after deleting
                    } else {
                        throw new Error('Error deleting category');
                    }
                })
                .catch(error => console.error('Error deleting category:', error));
            }
        }

        // Load categories when the page loads
        window.onload = loadCategories;