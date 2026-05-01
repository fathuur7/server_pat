import cors from "cors";

/**
 * Konfigurasi CORS untuk API
 */
export const corsMiddleware = cors({
  origin: [
    "http://localhost:3000", // Next.js dev
    "https://nadasaku.com",  // production
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
