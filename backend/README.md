# Backend

A simple REST API built with Node.js and Express.

## Features

- **Users API**: Create, read users
- **Tasks API**: Full CRUD operations for tasks
- **Health Check**: Monitor server status
- **CORS enabled**: For frontend integration
- **Comprehensive tests**: Unit tests with Jest and Supertest

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
