document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalAmountSpan = document.getElementById("total-amount");
    const totalItemsSpan = document.getElementById("total-items");
    const totalPriceSpan = document.getElementById("total-price");
    const viewCartButton = document.getElementById("view-cart-button");
    const discountCodeInput = document.getElementById("discount-code");
    const applyDiscountButton = document.getElementById("apply-discount");

    async function fetchCartItems() {
        try {
            const userId = 10000001; // Replace with the actual user ID
            const response = await fetch(`/api/cart/${userId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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

        cartItems.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-description">${item.description || 'No description available'}</p>
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.product_id}">
                    <button class="remove-btn" data-id="${item.product_id}">Remove</button>
                </div>
                <p class="item-price">$<span class="item-price-value">${item.price.toFixed(2)}</span></p>
            `;
            cartItemsContainer.appendChild(cartItem);

            cartItem.querySelector(".remove-btn").addEventListener("click", (e) => {
                removeItem(e.target.dataset.id);
            });

            cartItem.querySelector(".quantity-input").addEventListener("change", (e) => {
                updateQuantity(e.target.dataset.id, parseInt(e.target.value));
            });

            totalAmount += item.price * item.quantity;
        });

        totalAmountSpan.textContent = totalAmount.toFixed(2);
    }

    async function removeItem(productId) {
        try {
            await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE' });
            fetchCartItems();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item. Please try again later.');
        }
    }

    async function updateQuantity(productId, newQuantity) {
        try {
            await fetch(`/api/cart/update/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity })
            });
            fetchCartItems();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity. Please try again later.');
        }
    }

    function applyDiscount() {
        let discountCode = discountCodeInput.value.trim();
        let discount = 0;

        // Example discount logic; replace with your own
        if (discountCode === "DISCOUNT10") {
            discount = 0.10;
        } else if (discountCode === "DISCOUNT20") {
            discount = 0.20;
        }

        let totalAmount = parseFloat(totalAmountSpan.textContent);
        let discountedAmount = totalAmount * (1 - discount);
        totalAmountSpan.textContent = discountedAmount.toFixed(2);
    }

    applyDiscountButton.addEventListener("click", applyDiscount);

    fetchCartItems();
});
