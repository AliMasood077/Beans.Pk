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

    let cartItems = []; // Empty initially, will be populated with data from API

    // Fetch cart data from API
    async function fetchCartItems() {
        const userId = parseInt(localStorage.getItem('userid')); 
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/cart/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data); // Log the response

                // Directly assign the cart items since they are returned as an array
                cartItems = data; // Assuming 'data' is the array of cart items

                console.log('Cart items fetched:', cartItems); // Log the cart items
            } else {
                console.error('Failed to fetch cart items:', response.status);
            }
        } catch (error) {
            console.error('Error fetching cart items:', error);
        }
    }

    // Ensure cart data is fetched before any display actions
    async function loadCartItems() {
        await fetchCartItems(); // Wait for the cart items to be fetched
        displayCartItems(cartItems); // Then display the fetched items
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
        confirmOrderButton.style.display = 'none'; // Initially hide the Confirm Order button
    });

    // Show table and calculate total for "All Cart" option
    allCartRadio.addEventListener('change', function () {
        loadCartItems(); // Load cart items when "All Cart" is selected
        cartItemsContainer.style.display = 'block';
        confirmOrderButton.style.display = 'block';
    });

    // Show table for "Select from Cart" option and allow selection
    selectFromCartRadio.addEventListener('change', function () {
        loadCartItems(); // Load cart items when "Select from Cart" is selected
        cartItemsContainer.style.display = 'block';
        confirmOrderButton.style.display = 'block';
    });

    // Confirm Order action
    confirmOrderButton.addEventListener('click', function () {
        alert('Order confirmed! Thank you for shopping.');
    });

    // Function to display cart items in a table format
    function displayCartItems(cartItems) {
        cartItemsContainer.innerHTML = ""; // Clear previous content

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }

        const table = document.createElement("table");
        table.classList.add("cart-table");

        // Table header
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Select</th> <!-- Add checkbox column -->
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
            row.classList.add("cart-item-row");

            const itemTotal = parseFloat(item.price) * (item.quantity || 1); // Multiply price by quantity, default quantity to 1 if not provided

            row.innerHTML = `
                <td><input type="checkbox" class="item-checkbox" data-price="${item.price}" data-quantity="${item.quantity || 1}" checked></td> <!-- Checkbox for selection -->
                <td><img src="${item.image}" alt="${item.name}" class="cart-item-image"></td>
                <td>${item.name}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.quantity || 1}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            `;

            table.appendChild(row);

            totalAmount += itemTotal; // Accumulate total price
        });

        // Append the table to the container
        cartItemsContainer.appendChild(table);

        // Update the total price display
        totalAmountSpan.textContent = totalAmount.toFixed(2);

        cartItemsContainer.style.display = 'block'; // Ensure the container is visible

        // Update total amount based on selected items
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateTotal);
        });
    }

    // Function to update the total amount based on selected items
    function updateTotal() {
        let totalAmount = 0;
        const checkboxes = document.querySelectorAll('.item-checkbox:checked'); // Get checked checkboxes

        checkboxes.forEach(checkbox => {
            const price = parseFloat(checkbox.getAttribute('data-price'));
            const quantity = parseInt(checkbox.getAttribute('data-quantity'));
            totalAmount += price * quantity; // Calculate total for selected items
        });

        totalAmountSpan.textContent = totalAmount.toFixed(2); // Update total display
    }
});
