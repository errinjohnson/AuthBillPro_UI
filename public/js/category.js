const apiUrl = 'https://plankton-app-2-9k8uf.ondigitalocean.app/api/activity_types';
let isEditing = false;
let editLink = '';  // To store the edit link

// Handle form submission to add or edit a category
document.getElementById('categoryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const typeName = document.getElementById('type_name').value;
    
    if (isEditing && editLink) {
        // Use the hypermedia edit link provided by the server to update the category
        fetch(editLink, {
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
            editLink = ''; // Clear the edit link
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
function editCategory(typeId, typeName, editUrl) {
    document.getElementById('type_name').value = typeName;
    editLink = editUrl;  // Store the edit link for the category
    document.getElementById('submitBtn').innerText = 'Update Category'; // Change button text to update
    isEditing = true;
}

// Function to load categories from the API using hypermedia links
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
                        <button class="btn btn-warning btn-sm" onclick="editCategory(${category.type_id}, '${category.type_name}', '${category._links.edit.href}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCategory('${category._links.delete.href}')">Delete</button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error loading categories:', error));
}

// Function to handle deleting a category using the delete link from hypermedia controls
function deleteCategory(deleteUrl) {
    if (confirm('Are you sure you want to delete this category?')) {
        fetch(deleteUrl, {
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
