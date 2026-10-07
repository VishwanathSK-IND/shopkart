# ShopKart

**A full-stack MERN e-commerce application with secure authentication, a real-time shopping cart and Razorpay online payments.**

Customers can browse and search products, save favourites to a wishlist, manage a cart with live stock checks, pay online through Razorpay, and view their complete order history.

| | |
|---|---|
| **Live App** | [shopkart-chi-rouge.vercel.app](https://shopkart-chi-rouge.vercel.app) |
| **Backend API** | [shopkart-api-wcg9.onrender.com](https://shopkart-api-wcg9.onrender.com) |
| **Health Check** | [shopkart-api-wcg9.onrender.com/health](https://shopkart-api-wcg9.onrender.com/health) |
| **Source Code** | [github.com/VishwanathSK-IND/shopkart](https://github.com/VishwanathSK-IND/shopkart) |

> **Note:** The backend runs on the Render free plan and sleeps after about 15 minutes without traffic. The first request after that can take up to a minute while the server wakes up.
>
> **Test payments:** Razorpay runs in Test Mode, so no real money is charged. At checkout, use the UPI id `success@razorpay`.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution](#solution)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Architecture](#architecture)
6. [Project Structure](#project-structure)
7. [Database Design](#database-design)
8. [API Reference](#api-reference)
9. [Frontend Routes](#frontend-routes)
10. [Payment Flow](#payment-flow)
11. [Security](#security)
12. [Running Locally](#running-locally)
13. [Environment Variables](#environment-variables)
14. [Deployment](#deployment)
15. [Testing](#testing)
16. [Troubleshooting](#troubleshooting)
17. [Limitations and Future Scope](#limitations-and-future-scope)

---

## Problem Statement

Anyone building an online store runs into the same set of problems:

| Problem | What goes wrong |
|---|---|
| **Scattered data** | Prices, stock and carts kept in the frontend or copied into several places quickly go out of sync. |
| **Insecure login** | Tokens stored in localStorage can be stolen by any malicious script on the page (XSS). |
| **Untrustworthy payments** | If the browser decides the order total, or reports that a payment succeeded, anyone can tamper with it and get products for free. |
| **Inconsistent UI** | When the navbar, product cards and cart page each keep their own copy of the cart, they show different numbers. |
| **Lost purchase history** | If an order only points to a product, editing or deleting that product changes what the customer appears to have paid. |

## Solution

ShopKart is built around one rule: **the server is the single source of truth.**

| Problem | How ShopKart solves it |
|---|---|
| Scattered data | All products, wishlists, carts and orders live in MongoDB. The React app only displays what the API returns. |
| Insecure login | The JWT is stored in an HttpOnly cookie, which browser JavaScript can never read. |
| Untrustworthy payments | The backend calculates the total from the latest prices, creates the Razorpay order, and marks an order as paid only after verifying Razorpay's signature. |
| Inconsistent UI | The cart is held in one global React Context, so every component shows the same values instantly. |
| Lost purchase history | Every order stores a snapshot of the name, price, quantity and image at the time of purchase. |

---

## Features

### Authentication
- Register and log in with email and password, with passwords hashed using bcrypt
- JWT stored in an HttpOnly cookie, valid for 7 days, so the session survives a page refresh
- Cookie settings adapt automatically: `SameSite=Lax` locally, `SameSite=None; Secure` in production
- Protected pages redirect to the login page when the user is not logged in
- Change password and logout

### Products
- Product listing with search and category filter, both handled on the backend
- Product details page with price, category, image and stock
- Seed script with sample products across six categories

### Wishlist
- Add and remove products, saved per user in MongoDB
- Duplicate entries prevented by an atomic database update

### Cart
- Add to cart, change quantity and remove items
- Stock limits enforced on the server, so quantity can never exceed available stock
- Global cart state with the React Context API: the navbar count, product cards, cart page and order summary update together without a refresh
- Loading state per item, so only the row being updated shows a spinner
- Warning when stock drops below the quantity in the cart, with checkout blocked until it is fixed

### Checkout and Payments
- Shipping address form with validation
- Razorpay Checkout integration in Test Mode
- Order total calculated and stock checked again on the server before payment
- Payment signature verified on the server
- Cart cleared only after a verified payment

### Orders
- Order confirmation page
- My Orders page with full history, newest first, and status labels
- Order details page with purchased items and shipping address
- Customers can only ever see their own orders

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | User interface components |
| Vite 8 | Development server and production build |
| React Router DOM 7 | Page routing |
| Tailwind CSS 4 | Styling |
| Axios | HTTP requests with cookies (`withCredentials`) |
| Context API | Global cart state |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | REST API and middleware |
| Mongoose 9 | MongoDB schemas, validation and queries |
| JSON Web Token | Authentication |
| bcrypt | Password hashing |
| cookie-parser | Reading the auth cookie |
| cors | Cross-origin requests with credentials |
| dotenv | Environment variables |
| Razorpay SDK | Creating payment orders |

### Infrastructure
| Service | Role |
|---|---|
| Vercel | Hosts the React frontend |
| Render | Hosts the Express API |
| MongoDB Atlas | Cloud database |
| Razorpay | Payment gateway (Test Mode) |
| GitHub | Source code; pushing to `main` redeploys both Vercel and Render |

### Tools
| Tool | Purpose |
|---|---|
| Postman | API testing collection |
| nodemon | Backend auto restart during development |
| oxlint | Frontend linting |

---

## Architecture

```text
   Browser
      |
      |  loads the React app
      v
   Vercel  (React + Vite, static files)
      |
      |  HTTPS requests with the JWT cookie
      v
   Render  (Node.js + Express API)
      |                    |
      v                    v
   MongoDB Atlas        Razorpay
   (data)               (payments)
```

| Layer | Responsibility |
|---|---|
| **Frontend** | Renders the pages, holds the cart in a global Context, and calls the API through one Axios instance whose base URL comes from `VITE_API_URL`. |
| **Backend** | Every protected request passes through the auth middleware, which verifies the JWT cookie and attaches the user, before reaching the route and its controller. |
| **Database** | MongoDB Atlas stores customers, products and orders through Mongoose models. |
| **Payments** | Razorpay processes the payment. The secret key exists only on the backend. |

The React app never connects to MongoDB directly and never sees any secret. Everything goes through the Express API.

---

## Project Structure

```text
shopkart_project
    README.md

    server                              Backend (Node.js + Express), deployed on Render
        index.js                        App entry: CORS, middleware, health route, routes, DB connection
        package.json
        .env.example                    Template for backend environment variables
        config
            razorpay.js                 Razorpay SDK setup
        models
            customer.model.js           Customer profile, wishlist and cart
            product.model.js            Product name, price, image, category and stock
            order.model.js              Order items, address and payment details
        controllers
            customer.controller.js      Register, login, profile, logout, change password, cookie options
            product.controller.js       List with search and filter, get by id, create
            wishlist.controller.js      Add, get, remove
            cart.controller.js          Add, get, update quantity, remove
            order.controller.js         Create payment order, verify payment, list, get by id
        routes
            customer.routes.js          /customers
            product.routes.js           /products
            wishlist.routes.js          /wishlist
            cart.routes.js              /cart
            order.routes.js             /orders
        middlewares
            auth.middleware.js          Verifies the JWT cookie and attaches the user
        utils
            generateToken.js            Creates the JWT with a 7 day expiry
        seed
            product.seed.js             Inserts sample products
        postman
            ShopKart.postman_collection.json

    client_frontend                     Frontend (React + Vite + Tailwind), deployed on Vercel
        index.html
        vite.config.js
        vercel.json                     Sends every route to index.html so page refreshes work
        .env.example                    Template for frontend environment variables
        package.json
        src
            main.jsx
            App.jsx                     All routes, wrapped in the CartProvider
            context
                CartContext.jsx         Global cart state and calculated totals
            services
                api.js                  Axios instance (base URL from VITE_API_URL) and all API calls
            pages
                Register.jsx
                Login.jsx
                Home.jsx                Profile, product grid and search
                Products.jsx
                ProductDetails.jsx
                Wishlist.jsx
                Cart.jsx
                Checkout.jsx            Shipping form and Razorpay payment
                OrderSuccess.jsx
                Orders.jsx
                OrderDetails.jsx
            components
                Navbar.jsx  AuthLayout.jsx  SearchBar.jsx
                ProductCard.jsx  WishlistCard.jsx  CartItem.jsx
                CheckoutForm.jsx  OrderSummary.jsx
                OrderCard.jsx  OrderStatusBadge.jsx  OrderFallback.jsx
            hooks
                useOrder.js             Fetches a single order
            utils
                loadRazorpay.js         Loads the Razorpay script once
                format.js               Price, date and order id formatting
```

---

## Database Design

### Customer
| Field | Type | Notes |
|---|---|---|
| fullName | String | Required |
| email | String | Required and unique |
| password | String | bcrypt hash, never returned by the API |
| phone | String | |
| wishlist | Array of Product references | Only product ids are stored |
| cart | Array of { product reference, quantity } | Quantity is at least 1 |

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
| items | Array of { product, name, price, quantity, image } | Snapshot taken at purchase time |
| shippingAddress | { fullName, phone, addressLine1, city, state, pincode } | |
| totalAmount | Number | Calculated on the server |
| paymentStatus | String | PENDING, PAID or FAILED |
| status | String | PENDING_PAYMENT, PLACED, CONFIRMED, SHIPPED or DELIVERED |
| razorpayOrderId | String | |
| razorpayPaymentId | String | Card details are never stored |

### Design Decisions
- **Cart and wishlist store references.** They save only product ids and use `populate()` to load the details, so they always show the current price and stock.
- **Orders store snapshots.** They save a copy of the name, price and image at purchase time, so a past order never changes when a product is edited or deleted.

---

## API Reference

| Environment | Base URL |
|---|---|
| Production | `https://shopkart-api-wcg9.onrender.com` |
| Local | `http://localhost:3000` |

### Health
| Method | Endpoint | Login | Description |
|---|---|---|---|
| GET | `/health` | No | Returns `{ "status": "ok" }` when the server is running |

### Customers
| Method | Endpoint | Login | Description |
|---|---|---|---|
| POST | `/customers/register` | No | Create an account |
| POST | `/customers/login` | No | Log in and set the auth cookie |
| GET | `/customers/me` | Yes | Get the logged in customer |
| POST | `/customers/logout` | Yes | Clear the auth cookie |
| PATCH | `/customers/change-password` | Yes | Change the password |

### Products
| Method | Endpoint | Login | Description |
|---|---|---|---|
| GET | `/products?search=&category=` | Yes | List products, with optional search and category |
| GET | `/products/:id` | Yes | Get one product |
| POST | `/products` | No | Create a product |

### Wishlist
| Method | Endpoint | Login | Description |
|---|---|---|---|
| GET | `/wishlist` | Yes | Get my wishlist |
| POST | `/wishlist/:productId` | Yes | Add a product |
| DELETE | `/wishlist/:productId` | Yes | Remove a product |

### Cart
| Method | Endpoint | Login | Description |
|---|---|---|---|
| GET | `/cart` | Yes | Get my cart with full product details |
| POST | `/cart/:productId` | Yes | Add a product, or increase its quantity by one |
| PATCH | `/cart/:productId` | Yes | Set the quantity, body `{ "quantity": 3 }` |
| DELETE | `/cart/:productId` | Yes | Remove a product |

### Orders
| Method | Endpoint | Login | Description |
|---|---|---|---|
| POST | `/orders/create-payment-order` | Yes | Check the cart, create a pending order and a Razorpay order |
| POST | `/orders/verify-payment` | Yes | Verify the payment, mark the order as paid and clear the cart |
| GET | `/orders` | Yes | List my orders, newest first |
| GET | `/orders/:id` | Yes | Get one of my orders |

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

| Path | Page | Login |
|---|---|---|
| `/register` | Register | No |
| `/login` | Login | No |
| `/home` | Home with profile and products | Yes |
| `/products` | Product listing | Yes |
| `/products/:id` | Product details | Yes |
| `/wishlist` | Wishlist | Yes |
| `/cart` | Cart and order summary | Yes |
| `/checkout` | Shipping form and payment | Yes |
| `/order-success/:id` | Order confirmation | Yes |
| `/orders` | My orders | Yes |
| `/orders/:id` | Order details | Yes |

The root path and any unknown path redirect to the login page. Because of `vercel.json`, every route can be opened directly or refreshed on the live site.

---

## Payment Flow

| Step | Where | What happens |
|---|---|---|
| 1 | Frontend | The customer fills in the shipping address and clicks Pay. Only the address is sent. |
| 2 | Backend | Loads the cart and latest product prices, checks stock again and calculates the total in paise. |
| 3 | Backend | Saves an order with status PENDING_PAYMENT and creates a matching Razorpay order. |
| 4 | Backend | Returns the Razorpay order id and the public key id. |
| 5 | Frontend | Opens the Razorpay Checkout popup. |
| 6 | Razorpay | The customer completes the payment. |
| 7 | Frontend | Sends the payment id, order id and signature returned by Razorpay to the backend. |
| 8 | Backend | Recalculates the HMAC SHA256 signature with the secret key and compares it in constant time. |
| 9 | Backend | On a match, marks the order PAID and PLACED and clears the cart. Otherwise returns 400 and changes nothing. |
| 10 | Frontend | Clears the cart in the global state and shows the order confirmation page. |

### Test payment details

| Method | What to enter |
|---|---|
| UPI (easiest) | `success@razorpay` |
| Netbanking | Choose any bank, then click Success |
| Card | `5267 3181 8797 5449`, any future expiry, any CVV, OTP `1234` if asked |

---

## Security

| Measure | Protects against |
|---|---|
| Passwords hashed with bcrypt and never returned | Password leaks |
| JWT in an HttpOnly cookie | Token theft through XSS |
| `SameSite=None; Secure` cookie in production, sent over HTTPS only | Cookie interception |
| User id always taken from the verified JWT, never from the request | One user reading or changing another user's data (IDOR) |
| Order total calculated on the server; client amounts ignored | Price tampering |
| Razorpay signature verified with a constant time comparison | Fake payment confirmations |
| Stock checked on add to cart, quantity change and checkout | Overselling |
| Atomic MongoDB updates | Duplicates and race conditions from rapid clicks |
| CORS limited to the frontend origin, with credentials | Requests from other websites |
| Secrets kept in environment variables, never in Git | Leaked keys |

---

## Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) 20 or later, with npm
- [MongoDB](https://www.mongodb.com/) running locally, or a MongoDB Atlas connection string
- A [Razorpay](https://razorpay.com/) account with Test Mode API keys

### 1. Clone the repository
```bash
git clone https://github.com/VishwanathSK-IND/shopkart.git
cd shopkart
```

### 2. Start the backend
```bash
cd server
npm install
cp .env.example .env          # then fill in your own values
npm run seed:products         # optional: add sample products
npm run dev                   # http://localhost:3000
```

### 3. Start the frontend
In a second terminal:
```bash
cd client_frontend
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

### 4. Open the app
Go to `http://localhost:5173`, register an account and start shopping.

### Available scripts
| Folder | Command | Description |
|---|---|---|
| `server` | `npm run dev` | Start the API with auto restart |
| `server` | `npm start` | Start the API (used by Render) |
| `server` | `npm run seed:products` | Replace all products with the sample set |
| `client_frontend` | `npm run dev` | Start the development server |
| `client_frontend` | `npm run build` | Build for production into `dist` |
| `client_frontend` | `npm run preview` | Preview the production build |
| `client_frontend` | `npm run lint` | Lint the code |

---

## Environment Variables

### Backend (`server/.env`, and Render in production)

| Variable | Local value | Production value (Render) |
|---|---|---|
| `PORT` | `3000` | Do not set; Render provides it |
| `MONGO_URI` | `mongodb://localhost:27017/shopkart` | MongoDB Atlas connection string ending in `/shopkart?...` |
| `JWT_SECRET` | Any long random string | A different long random string |
| `NODE_ENV` | `development` | `production` |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Your test secret | Your test secret |
| `CLIENT_ORIGIN` | Leave unset (any localhost port is allowed) | `https://shopkart-chi-rouge.vercel.app` |

### Frontend (`client_frontend/.env`, and Vercel in production)

| Variable | Local value | Production value (Vercel) |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | `https://shopkart-api-wcg9.onrender.com` |

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> **Never commit `.env` files.** Both are listed in `.gitignore`. Only the `.env.example` templates are committed. Secrets such as `MONGO_URI`, `JWT_SECRET` and `RAZORPAY_KEY_SECRET` belong only on the backend, never in Vercel.

---

## Deployment

The whole stack runs on free plans.

| Part | Service | Cost |
|---|---|---|
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Database | MongoDB Atlas (M0 cluster) | Free |
| Payments | Razorpay Test Mode | Free |

### What was changed to make the app deployment ready
| Change | File | Why |
|---|---|---|
| Configurable API URL | `client_frontend/src/services/api.js` | The frontend reads the backend URL from `VITE_API_URL` instead of a hardcoded localhost address. |
| SPA rewrite | `client_frontend/vercel.json` | Opening or refreshing a route like `/cart` returns the app instead of a 404. |
| Production cookie settings | `server/controllers/customer.controller.js` | Vercel and Render are different sites, so the login cookie needs `SameSite=None` and `Secure`. |
| CORS from the environment | `server/index.js` | `CLIENT_ORIGIN` allows the Vercel site to call the API with cookies. |
| Health route | `server/index.js` | `/health` makes it easy to check whether the server is running. |
| Dynamic port | `server/index.js` | `process.env.PORT` lets Render choose the port. |

### 1. MongoDB Atlas
1. Create a free M0 cluster.
2. Create a database user with a password made of letters and numbers.
3. Under Network Access, allow `0.0.0.0/0` so Render can connect.
4. Copy the Node.js connection string and add the database name: `...mongodb.net/shopkart?appName=...`
5. Seed the products by running `npm run seed:products` with `MONGO_URI` pointing to Atlas.

### 2. Render (backend)
| Setting | Value |
|---|---|
| Service type | Web Service |
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Environment | `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_ORIGIN` |

### 3. Vercel (frontend)
| Setting | Value |
|---|---|
| Root Directory | `client_frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment | `VITE_API_URL` set to the Render URL |

### 4. Connect them
Set `CLIENT_ORIGIN` on Render to the Vercel URL (no trailing slash) and redeploy.

### Updating the live app
```bash
git add .
git commit -m "Describe the change"
git push
```
Pushing to `main` redeploys both Vercel and Render automatically. Vite reads `VITE_API_URL` at build time, so after changing it on Vercel you must redeploy the frontend.

---

## Testing

### Manual checklist (verified on the live site)
- Register, log in, refresh the page and stay logged in, log out
- Open `/home` and `/cart` directly in the address bar
- Search and filter products, open product details
- Add and remove wishlist items
- Add to cart, change quantity, remove items, refresh and keep the cart
- Check out with a Razorpay test payment and see the order in My Orders
- Confirm the `token` cookie is HttpOnly, Secure and SameSite=None

### Postman
A collection is included at `server/postman/ShopKart.postman_collection.json`.

1. Import it into Postman.
2. Set the collection variable `baseUrl` to `http://localhost:3000` for local testing or `https://shopkart-api-wcg9.onrender.com` for production.
3. Run Register and Login from the Customers folder. The auth cookie is saved automatically.
4. Run Get All Products, which saves a product id for later requests.
5. Run the Wishlist, Cart and Orders folders from top to bottom.

The collection covers normal cases and edge cases, such as duplicate wishlist entries, quantity above stock, requests without login, and a fake total amount being ignored.

> If you fill in the `razorpayKeySecret` collection variable, do not export or share the collection with that value.

---

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| The first request is very slow | The Render free plan was sleeping. Wait up to a minute and try again. |
| "Blocked by CORS policy" in the console | `CLIENT_ORIGIN` on Render must exactly match the Vercel URL, with `https` and no trailing slash. |
| Login succeeds but the user is sent back to login | The browser is blocking cross-site cookies. Allow third-party cookies for the site, or test in standard Chrome. |
| Requests still go to localhost on the live site | `VITE_API_URL` is missing on Vercel, or the frontend was not redeployed after setting it. |
| A page shows 404 after a refresh | `client_frontend/vercel.json` is missing. |
| `bad auth : authentication failed` | Wrong database password in `MONGO_URI`. |
| `MongoServerSelectionError` on Render | `0.0.0.0/0` is not allowed in Atlas Network Access. |
| `querySrv ECONNREFUSED` on a local machine | Node cannot resolve the `mongodb+srv` address. Turn off any VPN, set DNS to `8.8.8.8`, or use the standard `mongodb://` connection string from Atlas (Legacy URI String). |

---

## Limitations and Future Scope

| Current limitation | Planned improvement |
|---|---|
| Creating a product does not require login | Admin role and admin dashboard for products and orders |
| Order status stops at PLACED | Admin flow to mark orders CONFIRMED, SHIPPED and DELIVERED |
| Payment confirmation depends on the browser | Razorpay webhooks for payments completed after the browser closes |
| All products load at once | Pagination and sorting |
| No customer feedback | Product reviews and ratings |
| No notifications | Order confirmation emails |
| Testing is manual and Postman based | Automated unit and integration tests |
| Login cookie is cross-site | A custom domain so frontend and backend share one site |

---

Built as a full-stack learning project covering authentication, REST APIs, global state management, secure payment integration and cloud deployment.
