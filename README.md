# Sonalika Jewellers Management System

A comprehensive management system for Sonalika Jewellers with separate dashboards for Admin, Sales Team, and Production Team.

## Features

- **Admin Dashboard**: Complete system management
- **Sales Team Dashboard**: Client management and order tracking
- **Production Team Dashboard**: Product and design master management
- **Authentication**: Secure login system with role-based access
- **Local Development**: Fully configured for local development

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies for all parts:
   ```bash
   npm run install:all
   ```

## Running the Application

### Option 1: Run both frontend and backend together
```bash
npm run dev
```

### Option 2: Run separately

**Backend (Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

## Configuration

### Backend Configuration
- Backend runs on `http://localhost:3001`
- CORS is configured to allow `http://localhost:5173`, `http://localhost:3000`, and `http://localhost:3001`
- MongoDB connection should be configured in `backend/config/db.js`

### Frontend Configuration
- Frontend runs on `http://localhost:5173`
- Vite proxy is configured to forward `/api` requests to `http://localhost:3001`
- All API calls are hardcoded to use local backend

## Project Structure

```
sonalika-jewellers/
├── backend/                 # Express.js backend
│   ├── config/             # Database and external service configs
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication and file upload middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── services/          # Business logic services
├── frontend/              # React.js frontend
│   ├── src/
│   │   ├── Components/    # React components
│   │   └── ...
│   └── public/            # Static assets
└── package.json           # Root package.json for managing both apps
```

## API Endpoints

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `POST /teamlogin` - Team login

### Team Routes (`/api/team`)
- `POST /create-client` - Create new client
- `GET /get-clients` - Get all clients
- `POST /client-orders` - Create client order
- `GET /order-history/:uniqueId` - Get order history

### Production Team Routes (`/api/pdmaster`)
- `GET /getAllProductMasters` - Get all product masters
- `POST /createProductMaster` - Create product master
- `GET /getAllDesignMasters` - Get all design masters
- `POST /createDesignMaster` - Create design master
- `GET /category-size` - Get category sizes
- `POST /category-size` - Create category size

## Development Notes

- All external URLs (Render, Vercel) have been removed
- The application is configured for local development only
- Frontend uses Vite proxy for API calls
- Backend uses CORS for cross-origin requests
- No environment variables required for basic local development

## Troubleshooting

1. **Port conflicts**: Make sure ports 5000 and 5173 are available
2. **MongoDB connection**: Ensure MongoDB is running and connection string is correct
3. **CORS issues**: Check that frontend URL is in allowed origins list
4. **API calls failing**: Verify backend is running on port 5000

## License

ISC
