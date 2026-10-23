// Central API Base URL Configuration for Development & Production
// In Production on Vercel, set VITE_API_URL in Environment Variables (e.g., https://api.yourdomain.com or https://your-backend.onrender.com)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
