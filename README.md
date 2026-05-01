# E-Com App

A full-stack e-commerce application built with the MERN stack. It includes a customer-facing storefront (browse products, cart, checkout, orders, reviews) and an admin dashboard (manage products, categories, orders, and users) — with JWT authentication, role-based access control, and Cloudinary image uploads.

---

## Tech Stack

### Backend
- **Node.js** + **Express** (ES Modules)
- **MongoDB** + **Mongoose**
- **JWT** authentication (`jsonwebtoken`)
- **bcryptjs** for password hashing
- **Cloudinary** for image storage
- **Multer** for multipart uploads
- **CORS**, **dotenv**, **nodemon**

### Frontend
- **React 18** + **Vite**
- **React Router v6**
- **Tailwind CSS**
- **Axios**
- **React Hot Toast**
- Context API for auth and cart state

---

## Features

### Customer
- Register, login, profile, change password
- Browse products with category filtering
- Product detail page with reviews and ratings
- Cart (add, update quantity, remove, clear) — persisted server-side
- Checkout and order placement
- "My Orders" history and order detail page
- Submit reviews (only after purchase — eligibility check)

### Admin
- Protected admin dashboard with stats
- Manage products (create, edit, delete, image upload)
- Manage categories (create, edit, delete with auto slug)
- Manage orders (view all, update status, mark paid)
- Manage users (list, change role, delete)
- Single & multiple image upload to Cloudinary

### Platform
- JWT auth middleware (`protect`) and role guard (`adminOnly`)
- Centralized error handler & 404 middleware
- Seeder script to populate sample data
- Environment-based config

---

## Project Structure

```
E-com-app/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── slugify.js
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── admin/
    │   │   ├── components/   (AdminLayout, Sidebar, Topbar, ConfirmDialog, ImageUploader, StatCard)
    │   │   ├── pages/        (Dashboard, Products, ProductForm, Categories, Orders, Users)
    │   │   └── AdminRoute.jsx
    │   ├── api/              (axios instance + per-resource API modules)
    │   ├── components/       (Navbar, Footer, Loader, Stars, ProductReviews, ProtectedRoute)
    │   ├── context/          (AuthContext, CartContext)
    │   ├── pages/            (Home, ProductList, ProductDetail, Categories, Cart, Checkout,
    │   │                      OrderSuccess, MyOrders, OrderDetail, Login, Register, Profile,
    │   │                      ChangePassword)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vite.config.js
    ├── package.json
    └── .env
```

---

## Getting Started

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **MongoDB** (local instance or MongoDB Atlas)
- **Cloudinary** account (for image uploads)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd E-com-app
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=ecom-app
```

Seed sample data (optional):
```bash
npm run seed
```

Run the backend:
```bash
npm run dev      # development (with nodemon)
npm start        # production
```
Backend runs at **http://localhost:5000**.

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:
```bash
npm run dev      # development
npm run build    # production build
npm run preview  # preview production build
```
Frontend runs at **http://localhost:5173**.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Log in and receive a JWT |
| GET | `/profile` | User | Get current profile |
| PUT | `/profile` | User | Update profile |
| PUT | `/change-password` | User | Change password |

### Categories — `/api/categories`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all categories |
| GET | `/:slug` | Public | Get category by slug |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Products — `/api/products`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List products (with filters) |
| GET | `/:id` | Public | Get single product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products/:id/reviews` | Public | List product reviews |
| GET | `/api/products/:id/reviews/eligibility` | User | Check if user can review |
| POST | `/api/products/:id/reviews` | User | Create a review |
| DELETE | `/api/reviews/:id` | User | Delete own review |

### Cart — `/api/cart` (all routes require auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current user's cart |
| POST | `/` | Add item to cart |
| PUT | `/:productId` | Update item quantity |
| DELETE | `/:productId` | Remove item |
| DELETE | `/` | Clear cart |

### Orders — `/api/orders` (all routes require auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Place order |
| GET | `/me` | List my orders |
| GET | `/:id` | Get order by id |
| PUT | `/:id/pay` | Mark order as paid |

### Admin — `/api/admin` (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard stats |
| GET | `/users` | List all users |
| PUT | `/users/:id/role` | Update user role |
| DELETE | `/users/:id` | Delete user |
| GET | `/orders` | List all orders |
| PUT | `/orders/:id/status` | Update order status |

### Uploads — `/api/upload` (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Upload single image (`image` field) |
| POST | `/multiple` | Upload up to 8 images (`images` field) |
| DELETE | `/:publicId` | Delete image from Cloudinary |

---

## Authentication

- Stateless JWT — token returned on `register` / `login`.
- Frontend stores the token and sends it via `Authorization: Bearer <token>` (configured in `src/api/axios.js`).
- `protect` middleware verifies the token and loads the user.
- `adminOnly` middleware restricts admin-scoped routes.

---

## Available Scripts

**Backend (`/backend`)**
| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start in production |
| `npm run seed` | Populate the database with sample data |

**Frontend (`/frontend`)**
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `/dist` |
| `npm run preview` | Preview the production build |

---

## Environment Variables

### Backend (`backend/.env`)
| Key | Description |
|-----|-------------|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Server port (default `5000`) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | Target folder in Cloudinary |

### Frontend (`frontend/.env`)
| Key | Description |
|-----|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |

> Never commit real credentials. Add `.env` to `.gitignore` and share a `.env.example` instead.

---

## Deployment

- **Backend**: Render, Railway, Fly.io, or any Node host. Set the env vars from the table above.
- **Frontend**: Vercel, Netlify, or any static host. Set `VITE_API_URL` to the deployed backend URL and run `npm run build`.
- **Database**: MongoDB Atlas recommended in production.
- **Images**: Cloudinary is used directly — no extra config needed in the deployment host.

---

## Roadmap

- Stripe / Razorpay payment integration
- Wishlist
- Product search with full-text indexing
- Pagination & sorting on product listing
- Email notifications (order confirmation, status updates)
- Unit & integration tests

---

## License

This project is released for educational and personal use.

---

## Author

**Nityanand**
