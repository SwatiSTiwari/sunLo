# SunLo (सुनलो)

A warm companion booking + chat web app MVP. Tagline: "Koi sun raha hai, hamesha" — Someone is listening, always.

## Stack

- Frontend: Next.js 14 + Tailwind CSS
- Backend: Node.js + Express
- Database: Firebase Firestore
- Real-time Chat: Firebase Realtime Database
- Payments: Razorpay (test mode)
- Auth: Firebase Authentication
- Hosting: Vercel (frontend) + Render (backend)

## Project Structure

```
sunLo/
├── frontend/          # Next.js 14 app
├── backend/           # Express server
├── .env.example       # Required environment variables
└── package.json       # Root scripts
```

## Setup

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables and fill in your Firebase + Razorpay credentials:
   ```bash
   cp .env.example .env.local
   # Fill in .env.local for frontend
   # Copy required vars to backend/.env for the server
   ```

3. Download your Firebase service account key and save it as:
   ```
   backend/config/serviceAccountKey.json
   ```

4. Run both frontend and backend:
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   npm run dev:frontend
   npm run dev:backend
   ```

## Features

- Email/password auth with role selection (user / companion)
- Companion profile setup
- Browse and filter companions
- Book paid or first-free 15-minute sessions
- Razorpay checkout + signature verification
- Real-time chat with session timer
- User and companion dashboards

## Pricing

| Duration | Price |
|----------|-------|
| 15 mins  | ₹49   |
| 30 mins  | ₹99   |
| 1 hour   | ₹179  |

First 15-minute session is free.

## Revenue Split

- Razorpay fee: ~2%
- Companion earns: 75% of remaining
- Platform keeps: 25% of remaining

## Notes

- This is an MVP. Add real Firebase Storage photo upload, withdrawal flow, admin moderation, and deeper verification for production.
