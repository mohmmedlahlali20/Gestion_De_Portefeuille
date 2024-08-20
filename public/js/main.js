document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('deleteTypeButton').addEventListener('click', function() {
        const transactionId = this.getAttribute('data-id'); 

        if (confirm('Are you sure you want to delete this Transaction?')) {
            fetch(`/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            }).then(response => {
                if (response.ok) {
                    window.location.reload(); 
                } else {
                    return response.json().then(data => {
                        alert(data.error || 'Failed to delete the item.');
                    });
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting the item.');
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[id^="delete-button-"]').forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = this.getAttribute('data-id');
            const deleteFormId = `delete-form-${transactionId}`;
            const deleteForm = document.getElementById(deleteFormId);

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't delete this transaction",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteForm.submit();
                    Swal.fire(
                        'Deleted!',
                        'The transaction has been deleted.',
                        'success'
                    );
                }
            });
        });
    });
});



 
