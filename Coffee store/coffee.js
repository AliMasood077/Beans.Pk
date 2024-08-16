let userid = 2;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];


    // Function to add an item to the cart
    function addToCart(productId, productName, productPrice) {
        // Check if the product is already in the cart
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            // If the item already exists, increment its quantity
            existingItem.quantity += 1;
        } else {
            // Otherwise, add the new item to the cart
            const newItem = {
                productId,
                name: productName,
                price: productPrice,
                quantity: 1
            };
            cart.push(newItem);
        }

        // Save the updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update the cart total display
        updateCartTotal();

        // Get the current quantity of the product
        const currentQuantity = cart.find(item => item.productId === productId).quantity;

        // Show a notification that the item was added to the cart with the quantity
        showNotification(productName, currentQuantity);
    }

    // Attach event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const productName = this.parentElement.querySelector('h3').innerText;
            const productPrice = parseFloat(this.parentElement.querySelector('.price').innerText.replace('$', ''));

            addToCart(productId, productName, productPrice);
        });
    });
    function toggleDropdown() {

    var dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}
window.onclick = function(event) {
    if (!event.target.closest('.profile-container')) {
        var dropdown = document.getElementById("dropdown-menu");
        dropdown.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    
    // let userSignedIn = false; 
    let userProfilePicture = false; 

    const profileImg = document.getElementById("profile-img");
    const profileDropdown = document.getElementById("profile-dropdown");

    
    if (userid == -1) {

        profileImg.src = "path/to/icon.png";
        profileDropdown.innerHTML = `
            <a href="login.html">Login</a>
        `;

   
    }
     else  {
        if (userProfilePicture) {
            profileImg.src = "item-1.png"; 
        } else {
            profileImg.src = "icon.png";
        }

        profileDropdown.innerHTML = `
            <a href="/user/profile">My Profile</a>
            <a href="/user/settings">Settings</a>
            <a href="/logout">Logout</a>

        `;
    }
});


document.addEventListener("DOMContentLoaded", function () {
    // Cart functionality
    const cartButton = document.getElementById("cart-button");
    const itemContainer = document.getElementById("product-container");

    if (!itemContainer) {
        console.error('Element #product-container not found');
        return;
    }

    // Fetch products from API and render them
    fetch('http://127.0.0.1:5000/api/products') // Updated port
        .then(response => response.json())
        .then(products => {
            products.forEach(product => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-1');

                itemDiv.innerHTML = `
                    <img src="${product.image}" alt="">
                    <p class="price"> $${parseFloat(product.price).toFixed(2)}</p>
                    <p class="Name"> ${product.name}</p>
                    <p class="taste"> ${product.description}</p>
                    <p class="id">Product ID: ${product.id}</p>
                    <p class="id">Quantity: ${product.quantity}</p>
                    <p class="id">Store: ${product.store}</p>
                    <button class="item-btn">Add to cart</button>
                `;

                itemContainer.appendChild(itemDiv);
            });

            // Add event listeners to dynamically added buttons
            const itemButtons = document.querySelectorAll(".item-btn");
            itemButtons.forEach(button => {
                button.addEventListener("click", addToCart);
            });
        })
        .catch(error => console.error('Error fetching products:', error));

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

        const cartTotalElement = cartButton.querySelector("#cart-total");
        if (cartTotalElement) {
            cartTotalElement.textContent = `$${total.toFixed(2)} (${quantity})`;
        } else {
            console.error('Element #cart-total not found inside #cart-button');
        }
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
function a(username, userId) {
    console.log(`Username: ${username}, UserID: ${userId}`);
}
