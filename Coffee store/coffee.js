let userid;
let u_name = "";
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to add an item to the cart
function addToCart(productId) {
    const data = {
        user_id: userid, 
        product_id: productId
    };

    fetch('http://127.0.0.1:5000/api/add_to_cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
            showErrorNotification(data.error); // Display error notification
        } else {
            console.log('Success:', data.message);
            // showNotification('Product added to cart'); // Display success notification
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // showErrorNotification('Failed to add product to cart'); // Display error notification
    });
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
// Function to toggle chatbot visibility
function toggleChatbot() {
    const chatbotContainer = document.getElementById("chatbot-container");
    chatbotContainer.style.display = chatbotContainer.style.display === "none" ? "flex" : "none";
}

// Function to handle message sending
async function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    if (!userInput) return;

    const chatbox = document.getElementById("chatbox");

    // Display user's message
    const userMessage = document.createElement("div");
    userMessage.textContent = userInput;
    userMessage.className = "message user-message";
    chatbox.appendChild(userMessage);

    // Call backend chatbot API
    try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userInput }),
        });
        
        const data = await response.json();
        const botReply = data.reply || "Sorry, I couldn't understand that.";

        // Display bot's reply
        const botMessage = document.createElement("div");
        botMessage.textContent = botReply;
        botMessage.className = "message bot-message";
        chatbox.appendChild(botMessage);

        // Clear input and scroll down
        document.getElementById("userInput").value = "";
        chatbox.scrollTop = chatbox.scrollHeight;

    } catch (error) {
        console.error("Error:", error);
    }
}

// Initialize chatbot container display as hidden
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("chatbot-container").style.display = "none";
});

document.addEventListener("DOMContentLoaded", function () {
    // Profile dropdown handling
    userid = parseInt(localStorage.getItem('userid')) || 0;
    let userProfilePicture = false;
    const profileImg = document.getElementById("profile-img");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (userid == 0) {
        profileImg.src = "icon.png";
        profileDropdown.innerHTML = `<a href="login.html">Login</a>`;
    } else {
        profileImg.src = userProfilePicture ? "item-1.png" : "icon.png";
        profileDropdown.innerHTML = `
            <a href="/user/profile">My Profile</a>
            <a href="settings.html">Settings</a>
            <a href="/logout" id="logoutLink">Logout</a>
        `;
    }

    // Logout function
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior

            // Clear all data in localStorage
            localStorage.clear();

            // Set 'userid' to 0 to represent the logged-out state
            localStorage.setItem('userid', 0);

            // Update the UI to reflect the logged-out state
            profileImg.src = "icon.png"; // Replace with the correct path to your default icon
            profileDropdown.innerHTML = `<a href="login.html">Login</a>`;

            // Refresh the page to reflect the changes
            window.location.reload();
        });
    }

    const itemContainer = document.getElementById("product-container");

    if (itemContainer) {
        fetch('http://127.0.0.1:5000/api/products')
            .then(response => response.json())
            .then(products => {
                products.forEach(product => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item-1');
    
                    // Determine the color of the status indicator
                    const statusColor = product.status === 'active' ? 'green' : 'gray';
    
                    itemDiv.innerHTML = `
                        <img src="${product.image}" alt="">
                        <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                        <p class="Name">${product.name}</p>
                        <p class="taste">${product.description}</p>
                        <p class="id">Product ID: ${product.id}</p>
                        <p class="id">Quantity: ${product.quantity}</p>
                        <p class="id">Category: ${product.category}</p>
                        <p class="store">Store: ${product.store_name}</p>
                        <p></p>
                        <div class="status-container">
                            <span>Status: </span>
                            <span class="status-indicator" style="background-color: ${statusColor}; width: 10px; height: 10px; display: inline-block; border-radius: 50%;"></span>
                            <span>${product.status}</span>
                        </div>
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
        `User ID: ${userid}`,
        "Save 20% use code: Pakistan123 ",
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
