# 📚 LibraryOS - MERN Stack Library Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React Version](https://img.shields.io/badge/react-v18-blue)

**LibraryOS** is a modern, feature-rich **Library Management System** built with the **MERN** stack (MongoDB, Express, React, Node.js). It delivers a premium user experience with a responsive glassmorphic dark-mode interface, role-based dashboards, advanced security measures, and seamless library operations management.

---

## ✨ Key Features

### 🔐 Role-Based Access Control
- **System Administrator**: Full system control, user management, real-time audit logs, and analytics
- **Librarian**: Catalog management, book issuing/returns, publisher records, and purchase orders
- **Faculty & Students**: Personalized dashboards to browse catalogs, check out items, and track due dates

### 🚀 Developer-Friendly Database Setup
- **Zero Configuration**: Automatically starts a local `MongoMemoryServer` if no MongoDB URI is provided
- **Auto-Seeding**: Pre-populated mock data for instant testing and development

### 🛡️ Enterprise-Grade Security
- **Password Hashing**: Industry-standard bcryptjs encryption
- **JWT Authentication**: Short-lived access tokens with secure refresh mechanisms
- **HTTP-Only Cookies**: Secure, same-site cookies to prevent XSS/CSRF attacks
- **CORS Protection**: Configured for secure cross-origin requests

### 🎨 Modern UI/UX
- **Dark Glassmorphic Design**: Stunning, responsive interface built with Tailwind CSS
- **Interactive Components**: Smooth hover animations and micro-interactions
- **Mobile-First**: Fully responsive across all device sizes
- **Accessibility**: Semantic HTML and WCAG-compliant components

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS 3, React Router v6, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, Cookie Parser, CORS, BcryptJS |
| **Database** | MongoDB Atlas, Mongoose ORM, MongoMemoryServer (dev fallback) |
| **Tools** | npm, Git, PowerShell (Windows automation) |

---

## 📁 Project Structure

```
library_management_system/
├── backend/
│   ├── config/              # MongoDB connection configuration
│   ├── middleware/          # JWT authentication & validation middleware
│   ├── models/              # Mongoose schemas (Users, Books, Transactions, etc.)
│   ├── routes/              # Express API endpoints (Auth, Library CRUD, Admin)
│   ├── controllers/         # Business logic for routes (if present)
│   ├── seed.js              # Database seeding script with mock data
│   ├── server.js            # Express server entry point
│   ├── package.json
│   └── .env.example         # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Pages, Dashboards, Auth, UI)
│   │   ├── services/        # Axios API client with auth interceptors
│   │   ├── utils/           # Helper functions (logging, formatters, validators)
│   │   ├── hooks/           # Custom React hooks (if present)
│   │   ├── App.jsx          # Main app component & routing
│   │   └── main.jsx         # Application entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── vite.config.js       # Vite configuration
│   ├── package.json
│   └── .env.example         # Environment variables template
│
├── setup.ps1                # Automated setup script (Windows PowerShell)
├── start_server.ps1         # Backend startup helper script
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v9+ (included with Node.js)
- **MongoDB Atlas Account** (optional—app uses in-memory DB if not configured)
- **Git** for version control

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/VishnuReddyAdena/library_management_system.git
cd library_management_system

# Run automated setup (Windows)
./setup.ps1

# OR manual setup (all platforms)
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection (leave blank to use in-memory database)
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=8000

# Environment
NODE_ENV=development
```

**Note:** If `MONGO_URI` is empty, the app automatically uses MongoMemoryServer with pre-seeded test data.

### Step 3: Seed Database (Optional)

To populate the database with test accounts and sample data:

```bash
cd backend
npm run seed
```

**Test Accounts:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@library.edu` | `password123` |
| Librarian | `librarian@library.edu` | `password123` |
| Faculty | `faculty@library.edu` | `password123` |
| Student | `student@library.edu` | `password123` |

> **⚠️ Security Note**: Change these credentials immediately in production.

---

## 💻 Running Locally

### Start the Backend

```bash
cd backend
npm run dev
```

Backend API runs at: **`http://localhost:8000`**

Available endpoints:
- `GET /api/health` - Server health check
- `POST /api/auth/login` - User login
- `GET /api/books` - Fetch book catalog
- And more... (see API documentation)

### Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend application runs at: **`http://localhost:3005`**

Open in your browser and log in with test credentials.

### Development Tips
- Hot reload is enabled by default (Vite for frontend, nodemon for backend)
- Check browser console for API errors
- Backend logs appear in the terminal running `npm run dev`

---

## 📦 Available Scripts

### Backend
```bash
npm run dev        # Start development server with auto-reload
npm run seed       # Seed database with test data
npm start          # Start production server
```

### Frontend
```bash
npm run dev        # Start development server with Vite hot reload
npm run build      # Build for production
npm run preview    # Preview production build locally
```

---

## ☁️ Deployment

### Deploy Backend (Render, Heroku, Railway, etc.)

1. **Set Environment Variables:**
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET_KEY`: Generate a strong random secret
   - `NODE_ENV`: `production`
   - `PORT`: `8000` (or your platform's default)

2. **Build & Start Commands:**
   - Build: `npm install`
   - Start: `npm start`

3. **Example Render Deployment:**
   - Connect your GitHub repo
   - Set runtime: Node.js
   - Build command: `npm install`
   - Start command: `npm start`

### Deploy Frontend (Vercel, Netlify, GitHub Pages, etc.)

1. **Set Environment Variables:**
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://libraryos-api.onrender.com`)

2. **Build & Deploy:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Publish directory: `dist`

3. **Example Vercel Deployment:**
   - Import project from GitHub
   - Framework: Vite
   - Output directory: `dist`
   - Add environment variables
   - Deploy!

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Password hashing with bcryptjs
- JWT-based authentication
- HTTP-Only, Secure, SameSite cookies
- CORS restrictions
- Environment variable protection

⚠️ **For Production:**
- Change default test credentials
- Use strong, unique JWT secrets
- Enable HTTPS on both frontend and backend
- Set `NODE_ENV=production`
- Implement rate limiting
- Add request validation and sanitization
- Enable MongoDB IP whitelisting
- Use HTTPS-only cookies

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
# Ctrl+C to stop other processes or change PORT in .env
# Verify Node.js: node --version
```

### Frontend can't connect to backend
```bash
# Ensure backend is running on http://localhost:8000
# Check VITE_API_URL in frontend .env
# Check browser console for CORS errors
```

### Database connection issues
```bash
# If using MongoDB Atlas, verify connection string
# Check IP whitelist in MongoDB Atlas dashboard
# Ensure username/password are URL-encoded
```

### Port already in use
```bash
# Change PORT in backend/.env
# Change port in frontend/vite.config.js dev server config
```

---

## 📚 API Documentation

*Coming soon... For now, refer to the Express routes in `backend/routes/`*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Vishnu Reddy Adena**

- GitHub: [@VishnuReddyAdena](https://github.com/VishnuReddyAdena)
- Portfolio/Contact: (Add your links here)

---

## 📞 Support & Feedback

Found a bug or have a feature request? Please open an [issue](https://github.com/VishnuReddyAdena/library_management_system/issues).

---

<div align="center">

### ⭐ If you found this helpful, please consider giving it a star!

**Made with ❤️ by Vishnu Reddy Adena**

</div>
