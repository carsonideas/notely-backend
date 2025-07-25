/**
 * NOTELY BACKEND SERVER - APPLICATION ENTRY POINT
 * 
 * This file serves as the entry point for the Notely backend application.
 * It imports the configured Express app and starts the HTTP server.
 * 
 * Key Responsibilities:
 * - Import the configured Express application from app.ts
 * - Parse the PORT environment variable with proper type conversion
 * - Start the HTTP server listening on all network interfaces (0.0.0.0)
 * - Provide startup logging for monitoring and debugging
 * 
 * Network Configuration:
 * - Listens on 0.0.0.0 to allow external connections (required for deployment)
 * - Uses environment PORT variable with fallback to 5000
 * - Supports both development and production environments
 */

import app from './app';

// Parse the PORT environment variable as a number, with fallback to 5000
// Number() ensures type safety and proper TypeScript compilation
// Environment variables are always strings, so conversion is necessary
const PORT = Number(process.env.PORT) || 5000;

// Startup message with Houston theme (fun developer touch)
// This helps identify when the server is initializing in logs
console.log(`HOUSTON!!! are we ok...!!!,are ready to gooo........!!!`);

/**
 * Start the HTTP Server
 * 
 * The server listens on all network interfaces (0.0.0.0) rather than just
 * localhost (127.0.0.1) to allow external connections. This is essential for:
 * 
 * - Docker containers (where localhost refers to the container, not host)
 * - Cloud deployments (where the app needs to accept traffic from load balancers)
 * - Development environments with multiple network interfaces
 * - Testing from other devices on the same network
 * 
 * Parameters:
 * - PORT: The port number to listen on (from environment or default 5000)
 * - '0.0.0.0': Listen on all available network interfaces
 * - callback: Function executed when server starts successfully
 */
app.listen(PORT, '0.0.0.0', () => {
  // Success message with port information for easy identification
  // This confirms the server is running and shows which port to connect to
  console.log(`HOUSTON!! the App running on port ${PORT}... Yikes....!!`);
});

