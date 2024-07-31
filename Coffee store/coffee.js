document.addEventListener("DOMContentLoaded", function () {
    // Cart functionality
    const cartButton = document.getElementById("cart-button");
    const itemButtons = document.querySelectorAll(".item-btn");

    itemButtons.forEach(button => {
        button.addEventListener("click", addToCart);
    });

    function addToCart(event) {
        const item = event.target.closest(".item-1");
        const price = parseFloat(item.querySelector(".price").textContent.replace('$', ''));
        const name = item.querySelector(".Name").textContent;

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let existingItem = cart.find(i => i.name === name);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartTotal();
    }

    function updateCartTotal() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        let quantity = cart.reduce((acc, item) => acc + item.quantity, 0);

        cartButton.querySelector("#cart-total").textContent = `$${total.toFixed(2)} (${quantity})`;
    }

    updateCartTotal();

    // Carousel functionality
    const offerText = document.getElementById("offer-text");
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");

    const offers = [
        "Save 20% use code: Pakistan123",
        "Free shipping on orders over $50!",
        "Buy 2 get 1 free on select beans!"
    ];

    let currentIndex = 0;

    function updateOffer() {
        offerText.textContent = offers[currentIndex];
    }

    leftArrow.addEventListener("click", function () {
        currentIndex = (currentIndex === 0) ? offers.length - 1 : currentIndex - 1;
        updateOffer();
    });

    rightArrow.addEventListener("click", function () {
        currentIndex = (currentIndex === offers.length - 1) ? 0 : currentIndex + 1;
        updateOffer();
    });

    updateOffer();

    // Store dropdown functionality
    const storeDropdown = document.getElementById("store-dropdown");
    const storeTitle = document.getElementById("store-title");
    
    storeTitle.addEventListener("click", function () {
        if (storeDropdown.style.display === "none" || storeDropdown.style.display === "") {
            storeDropdown.style.display = "block";
            storeDropdown.style.transition = "all 0.3s ease";
        } else {
            storeDropdown.style.display = "none";
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!storeTitle.contains(event.target) && !storeDropdown.contains(event.target)) {
            storeDropdown.style.display = "none";
        }
    });
});
