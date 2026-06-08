const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { connectDB, getDbStatus } = require('./config/db');
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 8000;

// Configure CORS to support requests with credentials (cookies)
const allowedOrigins = ['http://localhost:3005', 'http://127.0.0.1:3005', 'http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(url => allowedOrigins.push(url.trim()));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(cookieParser());

// Register API Routes
const authRouter = require('./routes/auth');
const libraryRouter = require('./routes/library');
const otpRouter = require('./routes/otp');

app.use('/api/auth', authRouter);
app.use('/api/otp', otpRouter);
app.use('/api', libraryRouter);

// API root health check
app.get('/', (req, res) => {
  const status = getDbStatus();
  return res.json({
    message: 'LibraryOS Backend API is running ✅ (Node.js/Express MERN Version)',
    database: status,
    warning: status.includes('Ephemeral') 
      ? 'WARNING: Using an in-memory database. All registered users, activity logs, and library data will be permanently deleted when the server sleeps or restarts on Render. Please configure MONGODB_URI or MONGO_URI in your Render environment settings.' 
      : undefined,
    frontend: 'http://localhost:3005',
    api: '/api/',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

// Database connection and startup sequence
const startServer = async () => {
  const mongoUri = await connectDB();
  
  // If it's a memory database or local uri, auto-seed the schema
  if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost') || mongoUri.startsWith('mongodb://')) {
    console.log('Seeding initial mock database tables...');
    await seed(mongoUri);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
