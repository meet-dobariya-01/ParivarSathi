# ParivarSathi

ParivarSathi is a Gujarat welfare portal designed to simplify family-based benefit discovery and application tracking for citizens and officers.

## Overview

The platform helps:
- citizens create and manage their family profile
- check eligibility for government schemes
- apply for benefits and monitor application status
- officers review applications and manage scheme workflows

## Architecture

Detailed system diagrams and data model views are available in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Key Features

- Family and member registration
- Unique family identification for each household
- Dynamic eligibility evaluation using scheme rules
- Scheme discovery based on family and member data
- Application submission and tracking
- Officer dashboard with review and analytics

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Authentication: JWT
- Deployment: Vercel + Render

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Officer | `officer@gujarat.gov.in` | `password123` |
| Citizen | `rajesh@gmail.com` | `password123` |
| Citizen | `priya@gmail.com` | `password123` |

## Local Setup

### 1. Backend

```bash
cd server
npm install
node seed.js
npm start
```

The backend runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Environment

Create the required environment variables in the server app:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

For the frontend, configure the API base URL:

```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment

- Frontend: Vercel
- Backend: Render
- API URL for production: set `VITE_API_URL` to your deployed Render backend URL

## Project Status

This project is structured as an MVP for Gujarat family-benefit services and is ready for local development and deployment preparation.


