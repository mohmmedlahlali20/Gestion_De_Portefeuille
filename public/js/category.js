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

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
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
                        Swal.fire(
                            'Deleted!',
                            'The category has been deleted.',
                            'success'
                        );
                    })
                    .catch(error => {
                        console.error('Error deleting category:', error);
                        Swal.fire(
                            'Error!',
                            'An error occurred while deleting the category.',
                            'error'
                        );
                    });
                }
            });
        });
    });
});


closeModalBtn.addEventListener('click', closeModal);
closeModalButton.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});
