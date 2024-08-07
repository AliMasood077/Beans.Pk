from flask import Flask, request, jsonify
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

@app.route('/api/products', methods=['POST'])
def add_product():
    try:
        data = request.get_json()
        
        name = data.get('name')
        price = data.get('price')
        description = data.get('description')
        image = data.get('image')
        quantity = data.get('quantity')

        if not all([name, price, description, image, quantity]):
            return jsonify({'error': 'Missing data fields'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO products (name, price, description, image, quantity) VALUES (%s, %s, %s, %s, %s)",
            (name, price, description, image, quantity)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Product added successfully!'}), 201
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE products SET name = %s, price = %s, description = %s, image = %s, quantity = %s WHERE id = %s",
            (name, price, description, image, quantity, product_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'Product not found.'}), 404
        
        return jsonify({'message': 'Product updated successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        data = request.form
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        address = data.get('address')
        country = data.get('country')
        city = data.get('city')
        zipcode = data.get('zipcode')
        word = data.get('word')

        if not all([username, email, password, address, country, city, zipcode, word]):
            return jsonify({'error': 'Missing data fields'}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(id) FROM users")
        max_id = cursor.fetchone()[0]
        if max_id:
            user_id = int(max_id) + 1
        else:
            user_id = 10000001

        cursor.execute(
            "INSERT INTO users (id, username, email, password, address, country, city, zipcode, word) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (user_id, username, email, password, address, country, city, zipcode, word)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.form
        email = data.get('email')
        password = data.get('password')

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and user['password'] == password:
            return jsonify({'message': 'Login successful!', 'user': user}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    
    return render_template('login.html')

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

if __name__ == '__main__':
    app.run(debug=True)
