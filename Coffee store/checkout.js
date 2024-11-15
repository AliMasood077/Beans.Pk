document.addEventListener('DOMContentLoaded', function () {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    const nextToStep2Button = document.getElementById('next-to-step-2');
    const nextToStep3Button = document.getElementById('next-to-step-3');
    
    const backToStep1Button = document.getElementById('back-to-step-1');
    const confirmOrderButton = document.getElementById('confirm-order');
    
    const allCartRadio = document.getElementById('allCart');
    const selectFromCartRadio = document.getElementById('selectFromCart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalAmountSpan = document.getElementById('total-price');
    
    const discountCodeInput = document.getElementById('discountCode');
    const applyDiscountButton = document.getElementById('apply-discount');

    let cartItems = []; // Empty initially, will be populated with data from API
    let discounts = []; // Empty initially, will store discounts fetched from API

    // Fetch cart data from API
    async function fetchCartItems() {
        const userId = parseInt(localStorage.getItem('userid')); 
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/cart/${userId}`);
            if (response.ok) {
                const data = await response.json();
                cartItems = data;
            } else {
                console.error('Failed to fetch cart items:', response.status);
            }
        } catch (error) {
            console.error('Error fetching cart items:', error);
        }
    }

    // Fetch discounts from API
    async function fetchDiscounts() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/discounts/live');
            if (response.ok) {
                discounts = await response.json();
            } else {
                console.error('Failed to fetch discounts:', response.status);
            }
        } catch (error) {
            console.error('Error fetching discounts:', error);
        }
    }

    // Ensure cart and discount data are fetched before any display actions
    async function loadCartAndDiscounts() {
        await fetchCartItems();
        await fetchDiscounts();
        displayCartItems(cartItems);
    }

    // Go to Step 2
    nextToStep2Button.addEventListener('click', function () {
        step1.style.display = 'none';
        step2.style.display = 'block';
    });

    // Back to Step 1
    backToStep1Button.addEventListener('click', function () {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });

    // Go to Step 3 and display cart options
    nextToStep3Button.addEventListener('click', function () {
        step2.style.display = 'none';
        step3.style.display = 'block';
        confirmOrderButton.style.display = 'none';
    });

    // Show table and calculate total for "All Cart" option
    allCartRadio.addEventListener('change', function () {
        loadCartAndDiscounts();
        cartItemsContainer.style.display = 'block';
        confirmOrderButton.style.display = 'block';
    });

    // Show table for "Select from Cart" option
    selectFromCartRadio.addEventListener('change', function () {
        loadCartAndDiscounts();
        cartItemsContainer.style.display = 'block';
        confirmOrderButton.style.display = 'block';
    });

    // Confirm Order action
    confirmOrderButton.addEventListener('click', async function () {
        const userId = parseInt(localStorage.getItem('userid'));
        const discountCode = discountCodeInput.value.trim();
        const cartItemsToSubmit = [];
    
        // Gather selected items
        const checkboxes = document.querySelectorAll('.item-checkbox:checked');
        checkboxes.forEach(checkbox => {
            const price = parseFloat(checkbox.getAttribute('data-price'));
            const quantity = parseInt(checkbox.getAttribute('data-quantity'));
            const productId = parseInt(checkbox.closest('tr').getAttribute('data-product-id')); // Get product_id from row attribute
    
            // Check if product_id is valid
            if (isNaN(productId)) {
                alert("Product ID is missing for one of the items.");
                return;  // Exit if product_id is missing
            }
    
            // Add the product to the cartItemsToSubmit array
            cartItemsToSubmit.push({ product_id: productId, quantity, price });
        });
    
        if (cartItemsToSubmit.length === 0) {
            alert("No items selected.");
            return; // Prevent submission if no items are selected
        }
    
        // Prepare data for order submission
        const orderData = {
            user_id: userId,
            discount_code: discountCode,
            cart_items: cartItemsToSubmit
        };
    
        // Send data to the backend API
        try {
            const response = await fetch('http://127.0.0.1:5000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
    
            if (response.ok) {
                const result = await response.json();
                alert(`Order confirmed! Your order ID is: ${result.order_id}`);
            } else {
                const error = await response.json();
                alert(`Failed to confirm order: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('An error occurred while processing your order. Please try again.');
        }
    });
    

    // Display cart items in a table
    function displayCartItems(cartItems) {
        cartItemsContainer.innerHTML = "";
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }
    
        const table = document.createElement("table");
        table.classList.add("cart-table");
    
        // Table header
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Select</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
        `;
        table.appendChild(headerRow);
    
        let totalAmount = 0;
    
        // Loop through cart items and create rows
        cartItems.forEach(item => {
            const row = document.createElement("tr");
            const itemTotal = parseFloat(item.price) * (item.quantity || 1);
    
            // Add data-product-id attribute to each row
            row.setAttribute('data-product-id', item.product_id); // Ensure the product_id is stored here
    
            row.innerHTML = `
                <td><input type="checkbox" class="item-checkbox" data-price="${item.price}" data-quantity="${item.quantity || 1}" checked></td>
                <td><img src="${item.image}" alt="${item.name}" class="cart-item-image"></td>
                <td>${item.name}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.quantity || 1}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            `;
    
            table.appendChild(row);
            totalAmount += itemTotal;
        });
    
        cartItemsContainer.appendChild(table);
        totalAmountSpan.textContent = totalAmount.toFixed(2);
    
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => checkbox.addEventListener('change', updateTotal));
    }
    

    // Update total amount based on selected items
    function updateTotal() {
        let totalAmount = 0;
        const checkboxes = document.querySelectorAll('.item-checkbox:checked');
        checkboxes.forEach(checkbox => {
            const price = parseFloat(checkbox.getAttribute('data-price'));
            const quantity = parseInt(checkbox.getAttribute('data-quantity'));
            totalAmount += price * quantity;
        });
        totalAmountSpan.textContent = totalAmount.toFixed(2);
    }

    // Apply discount to total amount
    function applyDiscount() {
        const discountCode = discountCodeInput.value.trim();
        const discount = discounts.find(d => d.code === discountCode);
    
        if (discount) {
            const discountPercentage = parseFloat(discount.percentage) / 100;
    
            // Recalculate the total based on selected items
            let totalAmount = 0;
            const checkboxes = document.querySelectorAll('.item-checkbox:checked');
            checkboxes.forEach(checkbox => {
                const price = parseFloat(checkbox.getAttribute('data-price'));
                const quantity = parseInt(checkbox.getAttribute('data-quantity'));
                totalAmount += price * quantity;
            });
    
            // Apply the discount to the recalculated total
            const discountedAmount = totalAmount * (1 - discountPercentage);
            totalAmountSpan.textContent = discountedAmount.toFixed(2);
    
            alert(`Discount applied: ${discount.percentage}% off!`);
        } else {
            alert("Invalid discount code. Please try again.");
        }
    }
    

    applyDiscountButton.addEventListener("click", applyDiscount);
});
