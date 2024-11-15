document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalAmountSpan = document.getElementById("total-amount");
    const totalItemsSpan = document.getElementById("total-items");
    const totalPriceSpan = document.getElementById("total-price");
    const discountCodeInput = document.getElementById("discount-code");
    const applyDiscountButton = document.getElementById("apply-discount");

    async function fetchCartItems() {
        try {
            const userId = parseInt(localStorage.getItem('userid')); // Ensure userId is correctly set
            if (!userId) {
                throw new Error("User ID not found in local storage.");
            }
            const response = await fetch(`http://127.0.0.1:5000/api/cart/${userId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const cartItems = await response.json();
            displayCartItems(cartItems);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            alert('Failed to load cart items. Please try again later.');
        }
    }

    function displayCartItems(cartItems) {
        cartItemsContainer.innerHTML = "";
        let totalAmount = 0;
        let totalItems = 0;

        cartItems.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item-horizontal"); // New class for horizontal layout
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-description">${item.description || 'No description available'}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-id="${item.product_id}" data-action="decrement">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.product_id}">
                        <button class="quantity-btn" data-id="${item.product_id}" data-action="increment">+</button>
                    </div>
                    <button class="remove-btn" data-id="${item.product_id}">Remove</button>
                </div>
                <p class="item-price">$<span class="item-price-value">${item.price}</span></p>
            `;
            cartItemsContainer.appendChild(cartItem);

            cartItem.querySelector(".remove-btn").addEventListener("click", (e) => {
                removeItem(e.target.dataset.id);
            });

            cartItem.querySelector(".quantity-btn[data-action='increment']").addEventListener("click", (e) => {
                updateQuantity(e.target.dataset.id, parseInt(cartItem.querySelector(".quantity-input").value) + 1);
            });

            cartItem.querySelector(".quantity-btn[data-action='decrement']").addEventListener("click", (e) => {
                const currentQuantity = parseInt(cartItem.querySelector(".quantity-input").value);
                if (currentQuantity > 1) {
                    updateQuantity(e.target.dataset.id, currentQuantity - 1);
                }
            });

            cartItem.querySelector(".quantity-input").addEventListener("change", (e) => {
                updateQuantity(e.target.dataset.id, parseInt(e.target.value));
            });

            totalAmount += item.price * item.quantity;
            totalItems += item.quantity;
        });

        totalAmountSpan.textContent = totalAmount.toFixed(2);
        totalItemsSpan.textContent = totalItems;
    }

    async function removeItem(productId) {
        try {
            const userId = parseInt(localStorage.getItem('userid'));
            if (!userId) {
                throw new Error("User ID not found in local storage.");
            }
            const response = await fetch(`http://127.0.0.1:5000/api/cart/remove/${userId}/${productId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            fetchCartItems();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item. Please try again later.');
        }
    }

    async function updateQuantity(productId, newQuantity) {
        try {
            const userId = parseInt(localStorage.getItem('userid'));
            if (!userId) {
                throw new Error("User ID not found in local storage.");
            }
            await fetch(`http://127.0.0.1:5000/api/cart/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, product_id: productId, quantity: newQuantity })
            });
            fetchCartItems();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity. Please try again later.');
        }
    }

    

    fetchCartItems();
});
