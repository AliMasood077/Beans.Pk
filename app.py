from flask import Flask, request, jsonify, redirect, url_for, render_template
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'mySqlR8Pa66@f',
    'database': 'web'
}

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)


@app.route('/api/add/', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        print(data)  # Print the entire data object to see what is received

        # Retrieve fields from the request
        name = data.get('name')
        price = data.get('price')
        description = data.get('description')
        image = data.get('image')
        quantity = data.get('quantity')
        category = data.get('category')
        ven_id = data.get('ven_id')

        # Check for missing fields
        if not all([name, price, description, image, quantity, category, ven_id]):
            return jsonify({'error': 'Missing data fields'}), 400

        # Ensure database connection is managed properly
        with mysql.connector.connect(**db_config) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO products (name, price, description, image, quantity, category, ven_id) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (name, price, description, image, quantity, category, ven_id)
            )
            conn.commit()

        return jsonify({'message': 'Product added successfully!'}), 201

    except mysql.connector.Error as err:
        return jsonify({'error': f"Database error: {str(err)}"}), 500
    except Exception as e:
        return jsonify({'error': f"Unexpected error: {str(e)}"}), 500



@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'Product not found.'}), 404
        
        return jsonify({'message': 'Product deleted successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        description = data.get('description')
        image = data.get('image')
        quantity = data.get('quantity')
        category = data.get('category')  # Include the store field

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE products
            SET name = %s, price = %s, description = %s, image = %s, quantity = %s, category = %s
            WHERE id = %s
            """,
            (name, price, description, image, quantity, category, product_id)
        )
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'message': 'Product not found.'}), 404
        
        cursor.close()
        conn.close()

        return jsonify({'message': 'Product updated successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.form
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        address = data.get('address')
        country = data.get('country')
        city = data.get('city')
        zipcode = data.get('zipcode')
        word = data.get('word')

        # Check for missing fields
        if not all([username, email, password, address, country, city, zipcode, word]):
            return jsonify({'error': 'All fields are required!'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Get the max ID and increment for the new user
        cursor.execute("SELECT MAX(id) FROM users")
        max_id = cursor.fetchone()[0]
        user_id = int(max_id) + 1 if max_id else 10000001

        # Insert the new user into the database
        cursor.execute(
            "INSERT INTO users (id, username, email, password, address, country, city, zipcode, word) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (user_id, username, email, password, address, country, city, zipcode, word)
        )
        conn.commit()

        logging.debug("User successfully inserted into the database.") # type: ignore

        # Close the connection
        cursor.close()
        conn.close()

        # Return a success response
        return jsonify({'message': 'Signup successful!'}), 200

    except Exception as e:
        logging.error(f"An error occurred: {e}") # type: ignore
        return jsonify({'error': 'Error during signup. Please try again.'}), 500

@app.route('/api/vendor_signup', methods=['POST'])
def vendor_signup():
    try:
        data = request.form
        vendor_name = data.get('vendor_name')
        email = data.get('email')
        password = data.get('password')
        store_name = data.get('store_name')
        store = data.get('store')
        address = data.get('address')
        phone_number = data.get('phone_number')

        # Check for missing fields
        if not all([vendor_name, email, password, store_name, address, store]):
            return jsonify({'error': 'All required fields (vendor name, email, password, store name, address, store) must be filled!'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Check if the email or store_name already exists
        cursor.execute("SELECT * FROM vendor WHERE email=%s OR store_name=%s", (email, store_name))
        existing_vendor = cursor.fetchone()

        if existing_vendor:
            return jsonify({'error': 'A vendor with this email or store name already exists.'}), 401

        # Insert the new vendor into the database
        cursor.execute(
            "INSERT INTO vendor (vendor_name, email, password, store_name, address, phone_number, status ,store) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, 'non active')",
            (vendor_name, email, password, store_name, address, phone_number, store)
        )
        conn.commit()


        # Close the connection
        cursor.close()
        conn.close()

        # Return a success response
        return jsonify({'message': 'Vendor signup successful!'}), 200

    except Exception as e:
        logging.error(f"An error occurred: {e}")  # type: ignore
        return jsonify({'error': 'Error during vendor signup. Please try again.'}), 500


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        print(email,password)
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user and user['password'] == password:
            return jsonify({'message': 'Login successful!', 'user': {'username': user['username'], 'id': user['id']}}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except mysql.connector.Error as err:
        return jsonify({'error': f'Database error: {str(err)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
    finally:
        # Ensure the cursor and connection are closed even if an error occurs
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/login_vendor', methods=['POST'])
def login_vendor():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM vendor WHERE email = %s", (email,))
        vendor = cursor.fetchone()

        if vendor and vendor['password'] == password:
            return jsonify({'message': 'Login successful!', 'vendor': {'vendor_name': vendor['vendor_name'], 'vendor_id': vendor['vendor_id']}}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except mysql.connector.Error as err:
        return jsonify({'error': f'Database error: {str(err)}'}), 500
    except Exception as e:
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
    finally:
        # Ensure the cursor and connection are closed even if an error occurs
        if cursor:
            cursor.close()
        if conn:
            conn.close()



@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        data = request.form
        email = data.get('email')
        word = data.get('word')
        username = data.get('username')

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        if email and word:
            cursor.execute("SELECT * FROM users WHERE email = %s AND word = %s", (email, word))
        elif username:
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return jsonify({'message': 'User found', 'user': user}), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    return render_template('reset_pass.html')

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)


@app.route('/api/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cursor.close()
        conn.close()

        if cursor.rowcount == 0:
            return jsonify({'message': 'User not found.'}), 404
        
        return jsonify({'message': 'User deleted successfully!'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                uc.product_id, 
                p.name, 
                p.description, 
                p.price, 
                p.image, 
                uc.quantity
            FROM 
                user_cart uc
            JOIN 
                products p ON uc.product_id = p.id
            WHERE 
                uc.user_id = %s
        """, (user_id,))
        
        cart_items = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(cart_items), 200

    except mysql.connector.Error as err:
        print("MySQL error:", err)
        return jsonify({'error': str(err)}), 500
    except Exception as e:
        print("General exception:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/cart/remove/<int:user_id>/<int:product_id>', methods=['DELETE'])
def remove_item(user_id, product_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM user_cart 
            WHERE user_id = %s AND product_id = %s
        """, (user_id, product_id))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({'message': 'Item removed successfully!'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cart/update', methods=['PUT'])
def update_quantity():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        quantity = data.get('quantity')

        if not all([user_id, product_id, quantity]):
            return jsonify({'error': 'Missing data fields'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT quantity FROM user_cart 
            WHERE user_id = %s AND product_id = %s
        """, (user_id, product_id))
        result = cursor.fetchone()

        if result:
            new_quantity = quantity
            cursor.execute("""
                UPDATE user_cart 
                SET quantity = %s 
                WHERE user_id = %s AND product_id = %s
            """, (new_quantity, user_id, product_id))
        else:
            cursor.execute("""
                INSERT INTO user_cart (user_id, product_id, quantity) 
                VALUES (%s, %s, %s)
            """, (user_id, product_id, quantity))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Quantity updated successfully!'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/add_to_cart', methods=['POST'])
def add_to_cart():
    try:
        # Get data from the request
        data = request.get_json()
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        print(user_id , product_id)
        # Check for missing fields
        
        if not all([user_id, product_id]):
            return jsonify({'error': 'Missing data fields'}), 400

        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Check if the product is already in the cart
        cursor.execute(
            "SELECT quantity FROM user_cart WHERE user_id = %s AND product_id = %s",
            (user_id, product_id)
        )
        result = cursor.fetchone()

        if result:
            # If product exists, increment quantity
            new_quantity = result[0] + 1
            cursor.execute(
                "UPDATE user_cart SET quantity = %s WHERE user_id = %s AND product_id = %s",
                (new_quantity, user_id, product_id)
            )
        else:
            # If product does not exist, insert with quantity 1
            cursor.execute(
                "INSERT INTO user_cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
                (user_id, product_id, 1)
            )

        conn.commit()

        # Close the connection
        cursor.close()
        conn.close()

        # Return a success message
        return jsonify({'message': 'Product added to cart successfully!'}), 201

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/update_user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    conn = None
    cursor = None
    try:
        data = request.get_json()

        # Print received data and user_id
        print(f"Received data: {data}")
        print(f"Received user_id: {user_id}")

        # Construct the SQL query dynamically based on provided fields
        fields_to_update = []
        values = []

        if 'username' in data:
            fields_to_update.append('username = %s')
            values.append(data['username'])
        if 'email' in data:
            fields_to_update.append('email = %s')
            values.append(data['email'])
        if 'password' in data:
            fields_to_update.append('password = %s')
            values.append(data['password'])
        if 'address' in data:
            fields_to_update.append('address = %s')
            values.append(data['address'])
        if 'country' in data:
            fields_to_update.append('country = %s')
            values.append(data['country'])
        if 'city' in data:
            fields_to_update.append('city = %s')
            values.append(data['city'])
        if 'zipcode' in data:
            fields_to_update.append('zipcode = %s')
            values.append(data['zipcode'])
        if 'word' in data:
            fields_to_update.append('word = %s')
            values.append(data['word'])

        if not fields_to_update:
            return jsonify({'error': 'No fields provided for update'}), 400

        values.append(user_id)
        update_query = f"UPDATE users SET {', '.join(fields_to_update)} WHERE id = %s"

        # Print query and values
        print(f"Update query: {update_query}")
        print(f"Values: {tuple(values)}")

        # Execute the update query
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(update_query, tuple(values))
        conn.commit()

        # Check rows affected
        print(f"Rows affected: {cursor.rowcount}")

        if cursor.rowcount == 0:
            return jsonify({'error': 'User not found.'}), 404

        return jsonify({'message': 'User updated successfully!'}), 200
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/products_by_vendor/<int:ven_id>', methods=['GET'])
def products_by_vendor(ven_id):
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Fetch products for the specific vendor
        cursor.execute("SELECT * FROM products WHERE ven_id = %s", (ven_id,))
        products = cursor.fetchall()

        # Log fetched products
        print(f"Products fetched for vendor ID {ven_id}: {products}")

        cursor.close()
        conn.close()

        # Check if no products were found and return an appropriate response
        if not products:
            return jsonify({'message': 'No products found for this vendor'}), 404

        return jsonify(products)
    except mysql.connector.Error as err:
        return jsonify({'error': f"Database error: {str(err)}"}), 500
    except Exception as e:
        return jsonify({'error': f"Unexpected error: {str(e)}"}), 500



if __name__ == '__main__':
    app.run(host='', port=5000)
