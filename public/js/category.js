const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const closeModalButton = document.getElementById('closeModalButton');
const categoryForm = document.getElementById('categoryForm');
const modalTitle = document.getElementById('modalTitle');
const categoryName = document.getElementById('categoryName');

const openModal = () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

const closeModal = () => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

openModalBtn.addEventListener('click', () => {
    categoryForm.action = '/category';
    categoryForm.method = 'POST';
    modalTitle.textContent = 'Add New Category';
    categoryName.value = '';
    openModal();
});

document.querySelectorAll('.edit-button').forEach(button => {
    button.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        
        categoryForm.action = `/category/${id}?_method=PUT`;
        categoryForm.method = 'POST';
        modalTitle.textContent = 'Edit Category';
        categoryName.value = name;
        openModal();
    });
});

document.querySelectorAll('.delete-button').forEach(button => {
button.addEventListener('click', (e) => {
const id = e.target.getAttribute('data-id');
if (confirm('Are you sure you want to delete this category?')) {
    fetch(`/category/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.text();  
        }
    })
    .then(data => {
        console.log('Server response:', data); 
        e.target.closest('tr').remove();
    })
    .catch(error => {
        console.error('Error deleting category:', error);
        alert('An error occurred while deleting the category.');
    });
}
});
});


closeModalBtn.addEventListener('click', closeModal);
closeModalButton.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});