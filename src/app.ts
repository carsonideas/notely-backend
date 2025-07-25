
/**
 * NOTELY BACKEND APPLICATION - MAIN EXPRESS APP CONFIGURATION
 * 
 * This file serves as the central configuration hub for the Notely backend application.
 * It sets up the Express.js server with all necessary middleware, routing, and error handling.
 * 
 * Key Features:
 * - CORS configuration for cross-origin requests from the frontend
 * - Request/response body parsing with size limits
 * - Comprehensive request logging for debugging
 * - Modular route organization (auth, notes, user management)
 * - Global error handling with detailed logging
 * - Health check endpoint for monitoring
 * 
 * Architecture Pattern: This follows the MVC (Model-View-Controller) pattern where:
 * - Models are handled by Prisma ORM (in separate files)
 * - Views are JSON responses (API-only, no HTML templates)
 * - Controllers are organized in separate route files
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import userRoutes from './routes/user.routes';

// Load environment variables from .env file
// This must be called early to ensure all environment variables are available
dotenv.config();

// Create the main Express application instance
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

/**
 * Body Parsing Middleware
 * 
 * These middleware functions parse incoming request bodies and make them available
 * under the req.body property. The 10mb limit accommodates file uploads and large
 * note content while preventing abuse.
 */
app.use(express.json({ limit: '10mb' })); // Parse JSON payloads up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded form data

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * This configuration allows the frontend application to make requests to the backend
 * from different origins (domains/ports). This is essential for development where
 * frontend and backend run on different ports.
 * 
 * Security Features:
 * - Dynamic origin validation based on environment configuration
 * - Support for credentials (cookies, authorization headers)
 * - Explicit method and header allowlists
 */
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    // This is common for API testing tools and mobile applications
    if (!origin) return callback(null, true);
    
    // Allow all origins if CORS_ORIGIN environment variable is set to wildcard
    // This is useful for development but should be avoided in production
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    
    // Define allowed origins for cross-origin requests
    // This includes common development ports for various frontend frameworks
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000', // Environment-specific origin
      'http://localhost:3000', // Create React App default
      'http://localhost:3001', // Alternative React port
      'http://localhost:5173',  // Vite default development port
      'https://notely-frontend-lemon.vercel.app'
    ];
    
    // Check if the request origin is in the allowed list
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
 * 
 * This middleware logs all incoming requests with relevant details for debugging
 * and monitoring purposes. It helps track API usage and troubleshoot issues.
 * 
 * Logged Information:
 * - Timestamp in ISO format
 * - HTTP method and path
 * - Request body (for non-GET requests)
 * - Query parameters (if present)
 * - Content-Type and Authorization headers (sanitized)
 */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    body: req.method !== 'GET' ? req.body : undefined, // Only log body for mutations
    query: Object.keys(req.query).length > 0 ? req.query : undefined, // Only log if query params exist
    headers: {
      'content-type': req.headers['content-type'],
      // Sanitize authorization header to avoid logging sensitive tokens
      'authorization': req.headers.authorization ? 'Bearer token present' : 'No auth header'
    }
  });
  next(); // Continue to the next middleware
});

// ============================================================================
// API ROUTES AND ENDPOINTS
// ============================================================================

/**
 * API Welcome Endpoint
 * 
 * This endpoint provides basic information about the API and available routes.
 * It serves as a health check and documentation entry point.
 */
app.get('/api', (_req, res) => {
  res.status(200).json({
    message: "Welcome to the Notely API",
    endpoints: {
      auth: '/api/auth/*',      // Authentication and user registration
      notes: '/api/notes/*',    // Note management operations
      entries: '/api/entries/*', // Alternative endpoint for notes
      user: '/api/user/*'       // User profile management
    }
  });
});

/**
 * Route Mounting
 * 
 * This section mounts the modular route handlers to specific URL prefixes.
 * Each route module handles a specific domain of functionality:
 * 
 * - /api/auth: User authentication, registration, login, logout
 * - /api/notes: CRUD operations for notes and note management
 * - /api/entries: Alternative endpoint for notes (backward compatibility)
 * - /api/user: User profile operations and account management
 */
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/entries', noteRoutes); // Support both /notes and /entries endpoints for flexibility
app.use('/api/user', userRoutes);

/**
 * Health Check Endpoint
 * 
 * This endpoint is used by monitoring systems and load balancers to verify
 * that the application is running and responsive. It should always return
 * a 200 status code when the application is healthy.
 */
app.get('/health', (_req, res) => {
  res.status(200).json({ message: "API is healthy and running" });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global Error Handler
 * 
 * This middleware catches all errors that occur during request processing
 * and provides consistent error responses. It logs detailed error information
 * for debugging while returning sanitized error messages to clients.
 * 
 * Error Handling Strategy:
 * - Log full error details server-side for debugging
 * - Return sanitized error messages to prevent information leakage
 * - Handle specific error types (CORS, validation, etc.) appropriately
 * - Provide consistent JSON error response format
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log comprehensive error details for server-side debugging
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Handle CORS-specific errors with appropriate status code
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  
  // Handle general errors with fallback values
  const statusCode = err.statusCode || 500; // Use error's status code or default to 500
  const message = err.message || 'Internal server error'; // Use error's message or generic message
  
  // Return consistent error response format
  res.status(statusCode).json({ message });
});

/**
 * 404 Not Found Handler
 * 
 * This middleware handles requests to routes that don't exist. It should be
 * placed after all other routes to catch unmatched requests.
 * 
 * Features:
 * - Logs 404 requests for monitoring and debugging
 * - Returns consistent JSON response format
 * - Helps identify missing routes or incorrect client requests
 */
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'Route not found' });
});

// Export the configured Express application for use in server.ts
export default app;

