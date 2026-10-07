# ShopKart

ShopKart is a full-stack MERN e-commerce application. Customers can browse products, save them to a wishlist, manage a shopping cart, and pay online with Razorpay. It uses secure cookie-based authentication and keeps a complete order history for every customer.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Payment Flow](#payment-flow)
- [Security Measures](#security-measures)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known Limitations and Future Scope](#known-limitations-and-future-scope)

---

## Problem Statement

Anyone building an online store runs into the same set of problems:

1. **Scattered data.** When product prices, stock and carts are stored in the frontend or copied into several places, they quickly go out of sync.
2. **Insecure authentication.** Storing login tokens in localStorage exposes them to XSS attacks.
3. **Untrustworthy payments.** If the browser decides the order total, or tells the server that a payment succeeded, anyone can tamper with it and get products for free.
4. **Inconsistent UI.** When the navbar, product cards and cart page each keep their own copy of the cart, they show different numbers.
5. **Lost purchase history.** If an order only points to a product, changing or deleting that product changes what the customer appears to have paid.

## Solution

ShopKart is built around one rule: **the server is the single source of truth.**

1. All products, wishlists, carts and orders are stored in MongoDB. The React app only displays what the API returns.
2. Login issues a JWT stored in an HttpOnly cookie, so JavaScript running in the browser can never read it.
3. The backend calculates the order total from the latest product prices, creates the Razorpay order, and marks an order as paid only after verifying the Razorpay signature.
4. The cart is held in one global React Context, so every component shows the same values instantly.
5. Every order stores a snapshot of the product name, price, quantity and image at the time of purchase.

---

## Features

### Authentication
- Register and log in with email and password
- Passwords hashed with bcrypt
- JWT stored in an HttpOnly cookie, valid for 7 days, so the session survives a page refresh
- Protected pages redirect to the login page when the user is not logged in
- Change password and logout

### Products
- Product listing with search and category filter, both handled on the backend
- Product details page showing price, category, image and stock
- Seed script with sample products in Electronics, Footwear, Apparel, Bags, Home and Accessories

### Wishlist
- Add and remove products, saved per user in MongoDB
- Duplicate entries prevented with an atomic database update

### Cart
- Add to cart, increase or decrease quantity, and remove items
- Stock limits enforced on the server, so quantity can never exceed available stock
- Global cart state using the React Context API, so the navbar count, product cards, cart page and order summary update together without a refresh
- Loading state per item, so only the row being updated shows a spinner
- Warning when stock drops below the quantity in the cart, with checkout blocked until it is fixed

### Checkout and Payments
- Shipping address form with validation
- Razorpay Checkout integration in Test Mode
- Order total calculated and stock checked again on the server before payment
- Payment signature verified on the server
- Cart cleared only after a verified payment

### Orders
- Order success page
- My Orders page with full history, newest first, and status labels
- Order details page with purchased items and shipping address
- Customers can only see their own orders

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 | User interface components |
| Frontend | Vite | Development server and production build |
| Frontend | React Router DOM 7 | Page routing |
| Frontend | Tailwind CSS 4 | Styling |
| Frontend | Axios | HTTP requests with cookies |
| Frontend | Context API | Global cart state |
| Backend | Node.js | JavaScript runtime |
| Backend | Express 5 | REST API and middleware |
| Backend | Mongoose 9 | MongoDB schemas, validation and queries |
| Backend | JSON Web Token | Authentication |
| Backend | bcrypt | Password hashing |
| Backend | cookie-parser | Reading the auth cookie |
| Backend | cors | Cross-origin requests with credentials |
| Backend | dotenv | Environment variables |
| Database | MongoDB | Customers, products and orders |
| Payments | Razorpay | Online payment gateway in Test Mode |
| Tools | Postman | API testing |
| Tools | oxlint | Frontend linting |
| Tools | nodemon | Backend auto restart during development |

---

## System Architecture

The application has three layers.

| Layer | What it does |
|---|---|
| Frontend | A React app built with Vite and Tailwind. It shows the pages, holds the cart in a global Context, and calls the backend using Axios with cookies enabled. |
| Backend | A Node.js and Express API. Every protected request first passes through the auth middleware, which checks the JWT cookie, then reaches the route and its controller. |
| Services | MongoDB stores all data through Mongoose. Razorpay handles online payments. |

The React app never connects to MongoDB directly and never sees the Razorpay secret. Everything goes through the Express API.

---

## Project Structure

```text
shopkart_project
    README.md

    server                          Backend (Node.js and Express)
        index.js                    App entry, middleware, routes, database connection
        package.json
        .env.example                Template for environment variables
        config
            razorpay.js             Razorpay SDK setup
        models
            customer.model.js       Customer profile, wishlist and cart
            product.model.js        Product name, price, image, category and stock
            order.model.js          Order items, address and payment details
        controllers
            customer.controller.js  Register, login, profile, logout, change password
            product.controller.js   List with search and filter, get by id, create
            wishlist.controller.js  Add, get, remove
            cart.controller.js      Add, get, update quantity, remove
            order.controller.js     Create payment order, verify payment, list, get by id
        routes
            customer.routes.js      Customer endpoints
            product.routes.js       Product endpoints
            wishlist.routes.js      Wishlist endpoints
            cart.routes.js          Cart endpoints
            order.routes.js         Order endpoints
        middlewares
            auth.middleware.js      Verifies the JWT cookie and attaches the user
        utils
            generateToken.js        Creates the JWT with a 7 day expiry
        seed
            product.seed.js         Inserts sample products
        postman
            ShopKart.postman_collection.json

    client_frontend                 Frontend (React, Vite and Tailwind)
        index.html
        vite.config.js
        package.json
        src
            App.jsx                 All routes, wrapped in the CartProvider
            context
                CartContext.jsx     Global cart state and calculated totals
            services
                api.js              Axios instance and all API calls
            pages
                Register.jsx
                Login.jsx
                Home.jsx            Profile, product grid and search
                Products.jsx
                ProductDetails.jsx
                Wishlist.jsx
                Cart.jsx
                Checkout.jsx        Shipping form and Razorpay payment
                OrderSuccess.jsx
                Orders.jsx
                OrderDetails.jsx
            components
                Navbar.jsx
                AuthLayout.jsx
                SearchBar.jsx
                ProductCard.jsx
                WishlistCard.jsx
                CartItem.jsx
                CheckoutForm.jsx
                OrderSummary.jsx
                OrderCard.jsx
                OrderStatusBadge.jsx
                OrderFallback.jsx
            hooks
                useOrder.js         Fetches a single order
            utils
                loadRazorpay.js     Loads the Razorpay script once
                format.js           Price, date and order id formatting
```

---

## Database Design

### Customer

| Field | Type | Notes |
|---|---|---|
| fullName | String | Required |
| email | String | Required and unique |
| password | String | Stored as a bcrypt hash and never returned by the API |
| phone | String | |
| wishlist | Array of Product references | Only product ids are stored |
| cart | Array of product reference and quantity | Quantity is at least 1 |

### Product

| Field | Type |
|---|---|
| name | String |
| description | String |
| price | Number |
| image | String |
| category | String |
| stock | Number |
| createdAt | Date |

### Order

| Field | Type | Notes |
|---|---|---|
| user | Customer reference | Indexed for fast lookups |
| items | Array of product, name, price, quantity and image | Snapshot taken at purchase time |
| shippingAddress | fullName, phone, addressLine1, city, state, pincode | |
| totalAmount | Number | Calculated on the server |
| paymentStatus | String | PENDING, PAID or FAILED |
| status | String | PENDING_PAYMENT, PLACED, CONFIRMED, SHIPPED or DELIVERED |
| razorpayOrderId | String | |
| razorpayPaymentId | String | |

### Design Choices

1. **Cart and wishlist store references.** They save only product ids and load the product details when needed, so they always show the current price and stock.
2. **Orders store snapshots.** They save a copy of the name, price and image at purchase time, so a past order never changes when a product is edited or deleted.

---

## API Reference

Local base URL: `http://localhost:3000`

### Customers

| Method | Endpoint | Login Required | Description |
|---|---|---|---|
| POST | /customers/register | No | Create an account |
| POST | /customers/login | No | Log in and set the auth cookie |
| GET | /customers/me | Yes | Get the logged in customer |
| POST | /customers/logout | Yes | Clear the auth cookie |
| PATCH | /customers/change-password | Yes | Change the password |

### Products

| Method | Endpoint | Login Required | Description |
|---|---|---|---|
| GET | /products | Yes | List products, with optional search and category query parameters |
| GET | /products/:id | Yes | Get one product |
| POST | /products | No | Create a product |

### Wishlist

| Method | Endpoint | Login Required | Description |
|---|---|---|---|
| GET | /wishlist | Yes | Get my wishlist |
| POST | /wishlist/:productId | Yes | Add a product |
| DELETE | /wishlist/:productId | Yes | Remove a product |

### Cart

| Method | Endpoint | Login Required | Description |
|---|---|---|---|
| GET | /cart | Yes | Get my cart with full product details |
| POST | /cart/:productId | Yes | Add a product, or increase its quantity by one |
| PATCH | /cart/:productId | Yes | Set the quantity of a product |
| DELETE | /cart/:productId | Yes | Remove a product |

### Orders

| Method | Endpoint | Login Required | Description |
|---|---|---|---|
| POST | /orders/create-payment-order | Yes | Check the cart, create a pending order and a Razorpay order |
| POST | /orders/verify-payment | Yes | Verify the payment, mark the order as paid and clear the cart |
| GET | /orders | Yes | List my orders, newest first |
| GET | /orders/:id | Yes | Get one of my orders |

### Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Invalid input, invalid id, quantity above stock, empty cart or invalid payment signature |
| 401 | Not logged in or invalid token |
| 404 | Not found, or it belongs to another customer |
| 409 | Duplicate, such as a product already in the wishlist or an email already registered |
| 500 | Server error |

---

## Frontend Routes

| Path | Page | Login Required |
|---|---|---|
| /register | Register | No |
| /login | Login | No |
| /home | Home with profile and products | Yes |
| /products | Product listing | Yes |
| /products/:id | Product details | Yes |
| /wishlist | Wishlist | Yes |
| /cart | Cart and order summary | Yes |
| /checkout | Shipping form and payment | Yes |
| /order-success/:id | Order confirmation | Yes |
| /orders | My orders | Yes |
| /orders/:id | Order details | Yes |

The root path and any unknown path redirect to the login page.

---

## Payment Flow

| Step | Where | What happens |
|---|---|---|
| 1 | Frontend | The customer fills in the shipping address and clicks Pay |
| 2 | Backend | Loads the cart and the latest product prices, checks stock again and calculates the total in paise |
| 3 | Backend | Saves a new order with status PENDING_PAYMENT and creates a matching Razorpay order |
| 4 | Backend | Sends the Razorpay order id and the public key id to the frontend |
| 5 | Frontend | Opens the Razorpay Checkout popup |
| 6 | Razorpay | The customer completes the payment |
| 7 | Frontend | Receives the payment id, order id and signature from Razorpay and sends them to the backend |
| 8 | Backend | Recalculates the HMAC SHA256 signature using the secret key and compares it |
| 9 | Backend | If the signature matches, marks the order as PAID and PLACED and clears the cart. If not, returns an error and changes nothing. |
| 10 | Frontend | Clears the cart in the global state and shows the order success page |

In Test Mode, use Razorpay test cards or test UPI ids. No real money is charged.

---

## Security Measures

1. Passwords are hashed with bcrypt and never returned in any response.
2. The JWT is stored in an HttpOnly cookie, so browser JavaScript cannot read it. This protects against token theft through XSS.
3. The user id always comes from the verified JWT, never from the request body. This prevents one user from reading or changing another user's data.
4. The order total is always calculated on the server. Any amount sent by the browser is ignored.
5. The Razorpay signature is verified with a constant time comparison before an order is marked as paid.
6. Stock is checked again when adding to the cart, when changing quantity and at checkout.
7. Atomic MongoDB updates prevent duplicate entries and race conditions from rapid clicks.
8. Secrets are kept in the .env file, which is ignored by git. Only the public Razorpay key id reaches the browser.
9. CORS only allows the frontend origin, with credentials enabled.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) version 20 or later, with npm
- [MongoDB](https://www.mongodb.com/) running locally, or a MongoDB Atlas connection string
- A [Razorpay](https://razorpay.com/) account with Test Mode API keys

---

## Environment Variables

Create a file named `.env` inside the `server` folder. You can copy `server/.env.example` as a starting point.

| Variable | Example | Description |
|---|---|---|
| PORT | 3000 | Port for the API. Hosting platforms set this automatically. |
| MONGO_URI | mongodb://localhost:27017/shopkart | MongoDB connection string |
| JWT_SECRET | A long random string | Secret used to sign the JWT |
| NODE_ENV | development or production | Controls the secure cookie settings |
| RAZORPAY_KEY_ID | rzp_test_xxxxxxxx | Razorpay public key id |
| RAZORPAY_KEY_SECRET | Your secret key | Razorpay secret, used only on the server |
| CLIENT_ORIGIN | http://localhost:5173 | Frontend address allowed by CORS. Optional for local development. |

To generate a strong JWT secret, run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Never commit the .env file. It is already listed in .gitignore.

---

## Testing

A Postman collection is included at `server/postman/ShopKart.postman_collection.json`.

1. Import the collection into Postman.
2. Run Register and then Login from the Customers folder. The auth cookie is saved automatically.
3. Run Get All Products from the Products folder. This saves a product id for the next requests.
4. Run the Wishlist, Cart and Orders folders from top to bottom.

The collection covers normal cases and edge cases, such as duplicate wishlist entries, quantity above stock, requests without login, and a fake total amount being ignored.

---

## Deployment

| Part | Service |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Payments | Razorpay in Test Mode |

Live demo: coming soon

---

## Known Limitations and Future Scope

1. Creating a product does not require login. An admin role and an admin dashboard for managing products and orders can be added.
2. Order status after PLACED (CONFIRMED, SHIPPED, DELIVERED) is not yet updated by any admin flow.
3. Razorpay webhooks can be added to handle payments that finish after the browser is closed.
4. Pagination and sorting for the product list.
5. Product reviews and ratings.
6. Email notifications for order confirmation.
7. Automated unit and integration tests.

---

Built as a full-stack learning project covering authentication, REST APIs, global state management and secure payment integration.
