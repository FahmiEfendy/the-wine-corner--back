# 🍷 The Wine Corner - Backend API

Backend service for **The Wine Corner**, an e-commerce style application that provides product listing, product details, recommendations, and authentication. 

This backend exposes RESTful APIs for managing users, categories, and products.


## 📌 Features

- User authentication with JWT
- Secure password hashing
- Product CRUD operations
- Product recommendations
- Category management
- Image upload support


## 🌐 Live API
Base URL: https://api.thewinecorner.web.id/api


## 🛠️ Tech Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MySQL
- Authentication: JWT (jsonwebtoken)
- Password Hashing: bcryptjs
- File Upload: Multer
- Environment Config: dotenv
- UUID Generator: uuid


## 📚 API Endpoints

### 🔐 Auth
- `GET /users` – Get all users
- `POST /register` – Register new user
- `POST /login` – User login (JWT-based)

### 🗂️ Category
- `POST /category` – Create new category

### 🍾 Product
- `GET /products` – Get all products
- `GET /products/recommendation` – Get recommended products
- `GET /products/:productId` – Get product by ID
- `POST /products` – Create new product
- `PATCH /products/:productId` – Update product
- `DELETE /products/:productId` – Delete product


## 🚀 How to Run


### Requirements
- Node.js (v16+ recommended)
- XAMPP (MySQL enabled)

### Database Setup
- Start MySQL using XAMPP
- Create a database for this project
- Configure database credentials in .env
- Check .env.example for required environment keys

### Steps
```bash
npm install # install dependencies

npm run devStart # start with development environment

npm run start # start with production environment
```

After running the command, the application will be available at: http://localhost:5000/api


## 📬 Contact
- Email: itsfahmiefendy@gmail.com
- LinkedIn: https://www.linkedin.com/in/fahmi-efendy
