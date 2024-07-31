document.addEventListener("DOMContentLoaded", function () {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalAmountSpan = document.getElementById("total-amount");
    const totalItemsSpan = document.getElementById("total-items");
    const totalPriceSpan = document.getElementById("total-price");
    const viewCartButton = document.getElementById("view-cart-button");
    const discountCodeInput = document.getElementById("discount-code");
    const applyDiscountButton = document.getElementById("apply-discount");

    function displayCartItems() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsContainer.innerHTML = "";
        let totalAmount = 0;

        cart.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <div class="cart-item-details">
                    <p class="item-name">${item.name}</p>
                    <p class="item-description">${item.description || 'No description available'}</p>
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-name="${item.name}">
                    <button class="remove-btn">Remove</button>
                </div>
                <p class="item-price">$<span class="item-price-value">${item.price.toFixed(2)}</span></p>
            `;
            cartItemsContainer.appendChild(cartItem);

            cartItem.querySelector(".remove-btn").addEventListener("click", () => {
                removeItem(item.name);
            });

            cartItem.querySelector(".quantity-input").addEventListener("change", (e) => {
                updateQuantity(item.name, parseInt(e.target.value));
            });

            totalAmount += item.price * item.quantity;
        });

        totalAmountSpan.textContent = totalAmount.toFixed(2);
    }

    function removeItem(name) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter(item => item.name !== name);
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCartItems();
        updateCartTotal();
    }

    function updateQuantity(name, newQuantity) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.map(item => {
            if (item.name === name) {
                item.quantity = newQuantity;
            }
            return item;
        });
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCartItems();
        updateCartTotal();
    }

    function updateCartTotal() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        let quantity = cart.reduce((acc, item) => acc + item.quantity, 0);

        viewCartButton.querySelector("#cart-total").textContent = `$${total.toFixed(2)} (${quantity})`;
        totalItemsSpan.textContent = quantity;
        totalPriceSpan.textContent = total.toFixed(2);
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

    displayCartItems();
    updateCartTotal();
});
