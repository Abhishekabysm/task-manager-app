# Task Manager Application

A full-stack task management application built with Express.js, React (Next.js), and MongoDB.

## Features

- User authentication with JWT
- Project management (up to 4 projects per user)
- Task management with status tracking
- Responsive design for mobile and desktop
- User assignment for tasks
- Priority and status management
- Task filtering and search

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi

## Application Requirements

The application fulfills the following requirements:

### User Management
- User signup with email, password, name, and country
- User login with JWT authentication
- User profile management

### Project Management
- Each user can have up to 4 projects
- Create, read, update, and delete projects
- Project dashboard with task overview

### Task Management
- Create, read, update, and delete tasks
- Tasks have title, description, status, priority, due date
- Tasks are associated with projects
- Task filtering and search functionality
- Task assignment to users

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/task-manager-app.git
   cd task-manager-app
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ..
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory with the following variables:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```
   - Create a `.env.local` file in the root directory with:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000/api
     ```

4. Start the development servers:
   ```
   # Start backend server
   cd server
   npm start

   # In a new terminal, start frontend
   cd ..
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
  - Body: `{ name, email, password, country }`
- `POST /api/auth/login` - Login a user
  - Body: `{ email, password }`
- `GET /api/auth/me` - Get current user (requires authentication)

### Project Endpoints

- `GET /api/projects` - Get all projects for a user (requires authentication)
- `GET /api/projects/:id` - Get a single project with its tasks (requires authentication)
- `POST /api/projects` - Create a new project (requires authentication)
  - Body: `{ name, description }`
- `PUT /api/projects/:id` - Update a project (requires authentication)
  - Body: `{ name, description }`
- `DELETE /api/projects/:id` - Delete a project and its tasks (requires authentication)

### Task Endpoints

- `GET /api/tasks` - Get all tasks (with optional filters) (requires authentication)
- `GET /api/tasks/:id` - Get a single task (requires authentication)
- `POST /api/tasks` - Create a new task (requires authentication)
  - Body: `{ title, description, status, priority, dueDate, project, assignedTo }`
- `PUT /api/tasks/:id` - Update a task (requires authentication)
  - Body: `{ title, description, status, priority, dueDate, project, assignedTo }`
- `DELETE /api/tasks/:id` - Delete a task (requires authentication)

### User Endpoints

- `GET /api/users` - Get all users (requires authentication)
- `GET /api/users/:id` - Get a single user (requires authentication)

## Deployment

This application can be deployed using various platforms:

- Frontend: Vercel, Netlify
- Backend: Heroku, Railway, Render
- Database: MongoDB Atlas

## License

This project is licensed under the MIT License.