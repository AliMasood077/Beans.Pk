let userid;
let u_name = "";
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let categories;
let allProducts = [];

function filterSuggestions() {
    const input = document.getElementById('searchInput');
    const query = input.value.trim().toLowerCase();
    const dropdown = document.getElementById('dropdown');

    dropdown.innerHTML = ''; // Clear previous suggestions

    if (query) {
        const filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(query)
        );

        if (filteredProducts.length > 0) {
            filteredProducts.forEach(product => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = product.name;
                item.onclick = () => handleProductClick(product);
                dropdown.appendChild(item);
            });

            dropdown.classList.remove('hidden');
            dropdown.style.display = 'block'; // Ensure the dropdown is visible
        } else {
            dropdown.classList.add('hidden');
        }
    } else {
        dropdown.classList.add('hidden');
    }
}

function handleProductClick(product,productId) {
    const input = document.getElementById('searchInput');
    input.value = product.name;
    productId =product.id;
    localStorage.setItem('productId', productId);
        // Optionally, navigate to the other HTML page (e.g., show_product.html)
        window.location.href = 'show_product.html'; // Replace with your desired URL
    const dropdown = document.getElementById('dropdown');
    dropdown.classList.add('hidden'); // Hide the dropdown
}




async function fetchCategoryNames() {
    try {
        // Show loading indicator
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '<li>Loading categories...</li>';

        // Fetch categories from the API
        const response = await fetch('http://127.0.0.1:5000/category');
        categories = await response.json();

        // Clear loading message
        categoryList.innerHTML = '';

        // Check if categories are empty
        if (categories.length === 0) {
            categoryList.innerHTML = '<li>No categories available</li>';
            return;
        }

        // Add categories to the dropdown list
        categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category.name || category; // Adjust based on response structure
            li.addEventListener('click', () => fetchFilteredData(category.name || category)); // Use category name or category directly
            categoryList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching category names:', error);
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '<li>Error loading categories</li>';
    }
}

async function fetchFilteredData(categoryName) {
    const itemContainer = document.getElementById('product-container'); // Assuming the container has this ID
    if (itemContainer) {
        try {
            // Clear previous products before fetching new ones
            itemContainer.innerHTML = '';

            // Fetch products from the API with category filter
            const response = await fetch(`http://127.0.0.1:5000/api/products?category=${categoryName}`);
            const products = await response.json();

            if (products.length === 0) {
                itemContainer.innerHTML = '<p>No products available in this category.</p>';
                return;
            }

            // Add filtered products to the container
            products.forEach(product => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('item-1');

                // Determine the color of the status indicator
                const statusColor = product.status === 'active' ? 'green' : 'gray';
                const productImage = product.image ? product.image : 'placeholder.jpg';
                itemDiv.innerHTML = `
                    <img src="${productImage}" alt="Product Image" class="product-image" style="width: 500px; height: 200px; object-fit: cover;">
                    <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                    <p class="Name">${product.name}</p>
                    <p class="taste">${product.description}</p>
                    <p class="id">Product ID: ${product.id}</p>
                    <p class="id">Quantity: ${product.quantity}</p>
                    <p class="id">Category: ${product.category}</p>
                    <p class="store">Store: ${product.store_name}</p>
                    <p></p>
                    <div class="status-container">
                        // <span>Status: </span>
                        // <span class="status-indicator" style="background-color: ${statusColor}; width: 10px; height: 10px; display: inline-block; border-radius: 50%;"></span>
                        // <span>${product.status}</span>
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
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    } else {
        console.error('Element #product-container not found');
    }
}

// Initialize category list when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchCategoryNames();
});


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
document.addEventListener("DOMContentLoaded", function () {
    const totalAmountSpan = document.getElementById("cart-total");

    async function fetchCartTotal() {
        try {
            const userId = parseInt(localStorage.getItem('userid')); // Ensure userId is correctly set
            if (!userId) {
                // throw new Error("User ID not found in local storage.");
            }
            const response = await fetch(`http://127.0.0.1:5000/api/cart/${userId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const cartItems = await response.json();
            const total = calculateTotal(cartItems);
            displayTotal(total);
        } catch (error) {
            console.error('Error fetching cart total:', error);
        }
    }

    function calculateTotal(cartItems) {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    function displayTotal(total) {
        if (totalAmountSpan) {
            totalAmountSpan.textContent = `$${total.toFixed(2)}`;
        } else {
            console.error('Element #total-amount not found.');
        }
    }

    // Automatically call the function on page load
    fetchCartTotal();
});



// Function to toggle the dropdown menu
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown-menu");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}
function toggleChatbot() {
    const chatbotContainer = document.getElementById("chatbot-container");
    chatbotContainer.style.display = chatbotContainer.style.display === "none" ? "flex" : "none";

    // Load chats if opened
    if (chatbotContainer.style.display === "flex") {
        loadPreviousChats();
    }
}

// Load previous chats
async function loadPreviousChats() {
    const chatbox = document.getElementById("chatbox");
    chatbox.innerHTML = ""; // Clear chatbox

    try {
        const response = await fetch(`http://127.0.0.1:5000/chats?user_id=${userid}`);
        const data = await response.json();
        const messages = data.messages || [];

        messages.forEach(({ sender, message }) => {
            const msgDiv = document.createElement("div");
            msgDiv.textContent = message;
            msgDiv.className = `message ${sender === "user" ? "user-message" : "bot-message"}`;
            chatbox.appendChild(msgDiv);
        });

        chatbox.scrollTop = chatbox.scrollHeight; // Scroll to bottom
    } catch (error) {
        console.error("Error loading chats:", error);
    }
}


// Send a new message
async function sendMessage() {
    const userInput = document.getElementById("userInput").value;
    if (!userInput) return;

    const chatbox = document.getElementById("chatbox");

    // Display user's message
    const userMessage = document.createElement("div");
    userMessage.textContent = userInput;
    userMessage.className = "message user-message";
    chatbox.appendChild(userMessage);

    try {
        // Send the message to the backend
        const response = await fetch("http://127.0.0.1:5000/send_message_user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userid, sender: "user", message: userInput }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const adminReply = data.reply || "Admin will reply shortly.";

        // Display admin's reply
        const botMessage = document.createElement("div");
        botMessage.textContent = adminReply;
        botMessage.className = "message bot-message";
        chatbox.appendChild(botMessage);

        // Clear input and scroll down
        document.getElementById("userInput").value = "";
        chatbox.scrollTop = chatbox.scrollHeight;
    } catch (error) {
        console.error("Error sending message:", error);
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
                allProducts = products;
                products.forEach(product => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('item-1');
    
                    // Determine the color of the status indicator
                    const statusColor = product.status === 'active' ? 'green' : 'gray';
    
                    // Set product image or placeholder if not available
                    const productImage = product.image ? product.image : 'placeholder.jpg';
    
                    itemDiv.innerHTML = `
                        <img src="${productImage}" alt="Product Image" class="product-image" style="width: 500px; height: 200px; object-fit: cover;">
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
    
    

        const offerText = document.getElementById("offer-text");
        const leftArrow = document.getElementById("left-arrow");
        const rightArrow = document.getElementById("right-arrow");
    
        let offers = []; // Initialize an empty offers array
        let currentIndex = 0;
    
        // Function to fetch discounts from the API
        async function fetchDiscounts() {
            try {
                const response = await fetch("http://127.0.0.1:5000/api/discounts"); // Replace with your API URL
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const discounts = await response.json();
                // Populate the offers array with fetched discounts
                offers = discounts.map(discount => {
                    const { code, percentage, description } = discount;
                    return `${description || ''} Save ${percentage}% with code: ${code}`;
                });
    
                if (offers.length === 0) {
                    offers.push("No current offers available.");
                }
    
                updateOffer();
            } catch (error) {
                console.error("Failed to fetch discounts:", error);
                offers = ["Error loading offers. Please try again later."];
                updateOffer();
            }
        }
    
        // Function to update the displayed offer
        function updateOffer() {
            offerText.textContent = offers[currentIndex];
        }
    
        // Event listeners for carousel navigation
        leftArrow.addEventListener("click", function () {
            currentIndex = (currentIndex === 0) ? offers.length - 1 : currentIndex - 1;
            updateOffer();
        });
    
        rightArrow.addEventListener("click", function () {
            currentIndex = (currentIndex === offers.length - 1) ? 0 : currentIndex + 1;
            updateOffer();
        });
    
        // Fetch discounts on page load
        fetchDiscounts();
    

    // Category dropdown functionality
const categoryDropdown = document.getElementById("category-dropdown");
const categoryTitle = document.getElementById("category-title"); 

// Toggle the display of the category dropdown when clicking on the title
categoryTitle.addEventListener("click", function () {
    categoryDropdown.style.display = (categoryDropdown.style.display === "block") ? "none" : "block";
});

// Close category dropdown when clicking outside
document.addEventListener("click", function (event) {
    if (!categoryTitle.contains(event.target) && !categoryDropdown.contains(event.target)) {
        categoryDropdown.style.display = "none";
    }
});





// Function to handle image click and go to other page
document.addEventListener('click', function(event) {
    // Check if the clicked element is an image inside an element with class '.item-1'
    if (event.target && event.target.tagName === 'IMG' && event.target.closest('.item-1')) {
        
        // Get the productId from the closest '.item-btn' element
        const productDiv = event.target.closest('.item-1');
        const productId = productDiv.querySelector('.item-btn').getAttribute('data-product-id');
        
        // Save the productId to localStorage
        localStorage.setItem('productId', productId);
        
        // Optionally, navigate to the other HTML page (e.g., show_product.html)
        window.location.href = 'show_product.html'; // Replace with your desired URL
    }
});





    // Function to add item to the cart (same as your existing `addToCart` function)
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
                showNotification('Product added to cart'); // Display success notification
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorNotification('Failed to add product to cart'); // Display error notification
        });
}
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);  // Hide after 3 seconds
}
});
