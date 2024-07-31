document.addEventListener('DOMContentLoaded', function () {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const nextToStep2Button = document.getElementById('next-to-step-2');
    const nextToStep3Button = document.getElementById('next-to-step-3');
    const backToStep1Button = document.getElementById('back-to-step-1');
    const backToStep2Button = document.getElementById('back-to-step-2');
    const confirmOrderButton = document.getElementById('confirm-order');
    const orderSummary = document.getElementById('order-summary');

    nextToStep2Button.addEventListener('click', function () {
        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    backToStep1Button.addEventListener('click', function () {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    nextToStep3Button.addEventListener('click', function () {
        step2.style.display = 'none';
        step3.style.display = 'block';
        // Display order summary
        displayOrderSummary();
    });

    backToStep2Button.addEventListener('click', function () {
        step3.style.display = 'none';
        step2.style.display = 'block';
    });

    confirmOrderButton.addEventListener('click', function () {
        alert('Order confirmed! \n Thank you for Shopping at Beans.Pk');
        // Implement order confirmation logic
    });

    function displayOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        orderSummary.innerHTML = '';
        let totalPrice = 0;

        cart.forEach(item => {
            const itemElement = document.createElement('p');
            itemElement.textContent = `${item.name} - $${(item.price * item.quantity).toFixed(2)} (x${item.quantity})`;
            orderSummary.appendChild(itemElement);
            totalPrice += item.price * item.quantity;
        });

        const totalElement = document.createElement('p');
        totalElement.textContent = `Total: $${totalPrice.toFixed(2)}`;
        orderSummary.appendChild(totalElement);
    }
});
