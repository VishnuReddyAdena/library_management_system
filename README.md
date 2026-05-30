# LibraryOS (MERN Stack Edition) 📚✨

LibraryOS is a modern, premium, and feature-rich **Library Management System** built using the **MERN** (MongoDB, Express, React, Node.js) stack. It features a stunning, responsive glassmorphic dark-mode interface styled with Tailwind CSS, distinct portal dashboards for various roles (Admin, Librarian, Faculty, Student), automatic fine calculations, and secure JWT session management via HTTP-Only cookies.

---

## 🚀 Key Features

* **Role-Based Portals**:
  * **System Administrator**: Full system control, member management, and real-time audit logs.
  * **Librarian**: Catalog management, book issuing/returns, publishers, and purchase orders.
  * **Faculty & Student**: Custom dashboards to browse catalogs, check out items, and monitor due dates.
* **Database Fallback (Developer Friendly)**: Starts a local `MongoMemoryServer` (In-Memory MongoDB) out-of-the-box if no Atlas connection URI is found, auto-seeding the mock tables.
* **Premium Security**: 
  * Password hashing using `bcryptjs`.
  * Access tokens stored in client storage and short-lived.
  * Refresh tokens securely processed using secure, same-site `HTTP-Only` cookies to protect against XSS/CSRF attacks.
* **Modern UI/UX**: Dark glassmorphic interface, interactive components, hover micro-animations, and responsive layout using Tailwind CSS.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React (v18), Vite, Tailwind CSS (v3), React Router DOM (v6), Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT (JsonWebToken), Cookie Parser, CORS, BcryptJS |
| **Database** | MongoDB Atlas, Mongoose (ORM), MongoMemoryServer (In-Memory Mock fallback) |

---

## 📁 Repository Structure

```text
├── backend/
│   ├── config/              # DB connection config
│   ├── middleware/          # JWT Auth validation middleware
│   ├── models/              # Mongoose schemas (User, Library models)
│   ├── routes/              # Express API endpoints (Auth, Library CRUD)
│   ├── seed.js              # Database seeding script
│   ├── server.js            # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React pages & components (Dashboards, Auth, Home)
│   │   ├── services/        # Axios API Client (Auth interceptors)
│   │   ├── utils/           # Helper scripts (Audit logging)
│   │   ├── App.jsx          # Main application component & routes
│   │   └── main.jsx         # App entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── setup.ps1                # Automatic dependencies installer script
└── start_server.ps1         # Backend startup script helper
```

---

## 💻 Getting Started (Local Development)

### Prerequisites
* Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Installation
Run the automated installation PowerShell script:
```powershell
./setup.ps1
```
*(Or navigate to both the `backend` and `frontend` folders separately and run `npm install`).*

### 2. Environment Variables (`.env`)
Create a `.env` file inside the `backend/` directory to configure the database:
```env
MONGO_URI="your_mongodb_atlas_connection_string"
JWT_SECRET_KEY="your_custom_jwt_signing_key"
PORT=8000
```
*(Note: If you leave `MONGO_URI` blank, the app will automatically start an in-memory database and seed mock data).*

### 3. Database Seeding
To seed default test users and catalog items to your database:
```bash
cd backend
npm run seed
```
**Seed Accounts Available:**
* **Admin**: `admin@library.edu` (Password: `password123`)
* **Librarian**: `librarian@library.edu` (Password: `password123`)
* **Faculty**: `faculty@library.edu` (Password: `password123`)
* **Student**: `student@library.edu` (Password: `password123`)

---

## ⚙️ Running Locally

### Start Backend:
```bash
cd backend
npm run dev
```
*Backend API will run at `http://localhost:8000`.*

### Start Frontend:
```bash
cd frontend
npm run dev
```
*Frontend client will run at `http://localhost:3005`.*

---

## ☁️ Deployment Guidelines

### ⚡ Backend Deployment (e.g., Render, Heroku)
1. Add the environment variables:
   * `MONGO_URI`: Your MongoDB Atlas URI.
   * `NODE_ENV`: `production` (toggles HTTPS-only cookies).
   * `JWT_SECRET_KEY`: A secure random secret string.
2. Build/Start Commands:
   * Build command: `npm install`
   * Start command: `npm start`

### ⚡ Frontend Deployment (e.g., Vercel, Netlify)
1. Add the environment variables:
   * `VITE_API_URL`: URL of your deployed backend (e.g., `https://your-backend-api.onrender.com`).
2. Build/Start Commands:
   * Build command: `npm run build`
   * Output directory: `dist`
