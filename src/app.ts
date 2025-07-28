

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import userRoutes from './routes/user.routes';


dotenv.config();



const app = express();

app.use(express.json({ limit: '10mb' })); // Parse JSON payloads up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded form data

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    
    if (!origin) return callback(null, true);
    
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 
      'http://localhost:3000', 
      'http://localhost:3000', 
      'http://localhost:3001', 
      'http://localhost:5173',
      'https://notely-frontend-lemon.vercel.app',

    ];
    
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed request headers
};

app.use(cors(corsOptions));

/**
 * Request Logging Middleware
 * Logged Timestamp in ISO format
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined, 
    headers: {
      'content-type': req.headers['content-type'],
      
      'authorization': req.headers.authorization ? 'Bearer token present' : 'No auth header'
    }
  });
  next(); 
});


app.get('/api', (_req, res) => {
  res.status(200).json({
    message: "Welcome to the Notely API",
    endpoints: {
      auth: '/api/auth/*',      
      notes: '/api/notes/*',    
      entries: '/api/entries/*',
      user: '/api/user/*'       
    }
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/entries', noteRoutes); 
app.use('/api/user', userRoutes);


app.get('/health', (_req, res) => {
  res.status(200).json({ message: "API is healthy and running" });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log comprehensive error details for server-side debugging
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  
  
  const statusCode = err.statusCode || 500; 
  const message = err.message || 'Internal server error'; 
  
  
  res.status(statusCode).json({ message });
});

app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

export default app;

