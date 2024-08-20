document.getElementById('transactionForm').addEventListener('submit', function(event) {
    var valid = true;
    document.getElementById('typeError').textContent = '';
    document.getElementById('amountError').textContent = '';
    document.getElementById('dateError').textContent = '';
    document.getElementById('categoryError').textContent = '';

    var type = document.getElementById('type').value;
    var amount = document.getElementById('amount').value;
    var date = document.getElementById('date').value;
    var category = document.getElementById('category').value;

    if (!type) {
        document.getElementById('typeError').textContent = 'Please select a transaction type.';
        valid = false;
    }

    if (!amount || amount <= 0) {
        document.getElementById('amountError').textContent = 'Please enter a valid amount greater than 0.';
        valid = false;
    }

    if (!date) {
        document.getElementById('dateError').textContent = 'Please select a date.';
        valid = false;
    } else {
        var selectedDate = new Date(date);
        var today = new Date();

        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            document.getElementById('dateError').textContent = 'Date cannot be in the past.';
            valid = false;
        }
    }

    if (!category) {
        document.getElementById('categoryError').textContent = 'Please select a category.';
        valid = false;
    }

    if (!valid) {
        event.preventDefault();
    }
});




