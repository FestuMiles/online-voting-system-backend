# Online Voting System Backend

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/voting-system

# Session Secret (change this in production)
SESSION_SECRET=your-super-secret-session-key-here

# Server Port
PORT=3000

# Environment
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MongoDB

Make sure MongoDB is running on your system.

### 4. Start the Server

```bash
npm run dev
```

The server will start on port 3000 and automatically create sample election data.

## API Endpoints

### Elections

- `GET /api/elections` - Get all elections
- `GET /api/elections/:id` - Get election by ID
- `GET /api/elections/:id/positions` - Get positions for an election
- `GET /api/elections/:id/positions/:positionId/candidates` - Get candidates for a position
- `POST /api/elections/:id/positions/:positionId/vote` - Submit a vote (requires authentication)
- `POST /api/elections` - Create new election (requires admin authentication)

### Authentication

- `POST /reg/register` - User registration
- `POST /reg/login` - User login

## Sample Data

The system automatically creates sample elections on startup:

- Student Council Election 2024 (ongoing)
- Department Representative Election (upcoming)

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Hashed voter IDs for privacy
- One vote per position per voter
- Admin-only election creation
