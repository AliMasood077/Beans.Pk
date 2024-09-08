let userid = 2;
let u_name = "";
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to add an item to the cart
function addToCart(productId, productName, productPrice) {
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId, name: productName, price: productPrice, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartTotal();
    const currentQuantity = cart.find(item => item.productId === productId).quantity;
    showNotification(productName, currentQuantity);
}

// Function to update the cart total
function updateCartTotal() {
    let total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let quantity = cart.reduce((acc, item) => acc + item.quantity, 0);

    const cartTotalElement = document.querySelector("#cart-button #cart-total");
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${total.toFixed(2)} (${quantity})`;
    } else {
        console.error('Element #cart-total not found inside #cart-button');
    }
}

// Function to toggle the dropdown menu
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown when clicking outside
window.onclick = function(event) {
    if (!event.target.closest('.profile-container')) {
        document.getElementById("dropdown-menu").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Profile dropdown handling
    let userProfilePicture = false;
    const profileImg = document.getElementById("profile-img");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (userid == -1) {
        profileImg.src = "path/to/icon.png";
        profileDropdown.innerHTML = `<a href="login.html">Login</a>`;
    } else {
        profileImg.src = userProfilePicture ? "item-1.png" : "icon.png";
        profileDropdown.innerHTML = `
            <a href="/user/profile">My Profile</a>
            <a href="/user/settings">Settings</a>
            <a href="/logout">Logout</a>
        `;
    }

    // Fetch products and render them
    const itemContainer = document.getElementById("product-container");

    if (itemContainer) {
        fetch('http://127.0.0.1:5000/api/products')
            .then(response => response.json())
            .then(products => {
                products.forEach(product => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item-1');
                    itemDiv.innerHTML = `
                        <img src="${product.image}" alt="">
                        <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                        <p class="Name">${product.name}</p>
                        <p class="taste">${product.description}</p>
                        <p class="id">Product ID: ${product.id}</p>
                        <p class="id">Quantity: ${product.quantity}</p>
                        <p class="id">Store: ${product.store}</p>
                        <button class="item-btn" data-product-id="${product.id}">Add to cart</button>
                    `;
                    itemContainer.appendChild(itemDiv);
                });

                // Add event listeners to dynamically added buttons
                document.querySelectorAll(".item-btn").forEach(button => {
                    button.addEventListener("click", function() {
                        const item = button.closest(".item-1");
                        const productId = button.getAttribute('data-product-id');
                        const productName = item.querySelector(".Name").textContent;
                        const productPrice = parseFloat(item.querySelector(".price").textContent.replace('$', ''));

                        addToCart(productId, productName, productPrice);
                    });
                });
            })
            .catch(error => console.error('Error fetching products:', error));
    } else {
        console.error('Element #product-container not found');
    }

    // Initialize cart total display
    updateCartTotal();

    // Carousel functionality
    const offers = [
        "Save 20% use code: Pakistan123",
        "Free shipping on orders over $50!",
        "Buy 2 get 1 free on select beans!"
    ];

    let currentIndex = 0;
    const offerText = document.getElementById("offer-text");
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");

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
        storeDropdown.style.display = (storeDropdown.style.display === "block") ? "none" : "block";
    });

    // Close store dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!storeTitle.contains(event.target) && !storeDropdown.contains(event.target)) {
            storeDropdown.style.display = "none";
        }
    });
});

function a(username, userId) {
    u_name = username;
    userid = userId;
    console.log(`Username: ${username}, UserID: ${userId}`);
}