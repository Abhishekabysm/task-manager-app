# Task Manager Application (Take-Home Assignment)

This is a full-stack task management application built as a take-home assignment. It allows users to register, log in, create, view, update, delete, and assign tasks.

## Features

*   **User Authentication:** Secure registration and login using JWT and bcrypt password hashing.
*   **Task Management:** Full CRUD operations for tasks (`title`, `description`, `dueDate`, `priority`, `status`).
*   **Team Collaboration:** Tasks can be assigned to other registered users. Basic console log notifications on assignment (placeholder for real notifications).
*   **Dashboard:** Displays tasks with filtering options:
    *   Tasks assigned to the user.
    *   Tasks created by the user.
    *   Overdue tasks.
*   **Search & Filter:** Search tasks by title/description and filter by status & priority.
*   **API:** RESTful API built with Node.js and Express.
*   **Database:** MongoDB with Mongoose ODM.
*   **Frontend:** Responsive UI built with Next.js and Tailwind CSS.

## Tech Stack

*   **Frontend:** Next.js (React), Tailwind CSS, Axios
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JSON Web Tokens (JWT), bcrypt
*   **Validation:** Joi (Backend)

## Project Structure

```
.
├── app/                  # Next.js Frontend (App Router)
│   ├── components/       # Reusable React components (TaskCard, TaskModal, ProtectedRoute)
│   ├── context/          # React Context (AuthContext)
│   ├── hooks/            # Custom React hooks (if any)
│   ├── lib/              # Utility functions (api.js)
│   ├── login/            # Login page route
│   ├── register/         # Register page route
│   ├── dashboard/        # Dashboard page route
│   ├── globals.css       # Global styles
│   └── layout.js         # Root layout
├── public/               # Static assets for Next.js
├── server/               # Node.js Backend
│   ├── config/           # Database configuration (db.js)
│   ├── middleware/       # Express middleware (auth.js)
│   ├── models/           # Mongoose models (User.js, Task.js)
│   ├── routes/           # API routes (auth.js, tasks.js)
│   ├── .env              # Environment variables (MONGO_URI, JWT_SECRET) - **DO NOT COMMIT**
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
├── .gitignore
├── eslint.config.mjs     # ESLint config (Frontend)
├── jsconfig.json         # JS config (Frontend)
├── next.config.mjs       # Next.js config
├── package-lock.json     # Dependency lockfile (Frontend)
├── package.json          # Frontend dependencies & scripts
├── postcss.config.mjs    # PostCSS config (for Tailwind)
└── README.md             # This file
```

## Setup Instructions

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (usually comes with Node.js)
*   MongoDB (local instance or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd task-manager-app
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Configure Environment Variables (Backend):**
    *   Navigate to the `server` directory: `cd server`
    *   Create a `.env` file by copying the example: `cp .env.example .env` (or create it manually).
    *   Edit the `server/.env` file and add your configuration:
        ```dotenv
        # MongoDB Connection String - Replace with your actual URI
        MONGO_URI=mongodb://localhost:27017/taskmanager # Or your Atlas URI

        # JWT Secret Key - Replace with a strong, random secret
        JWT_SECRET=your_super_secret_jwt_key_here

        # Server Port (Optional - defaults to 5000 if not set)
        # PORT=5000
        ```
    *   **Important:** Replace placeholders with your actual MongoDB connection string and a strong, unique JWT secret. Keep this file secure and **do not** commit it to version control. Ensure `.env` is listed in your root `.gitignore` file (it should be if you used `create-next-app`).

## Running Locally

You need to run both the frontend and backend servers concurrently.

1.  **Run the Backend Server:**
    *   Open a terminal in the project root directory.
    *   Navigate to the server directory: `cd server`
    *   Start the server (using nodemon for development is recommended for auto-restarts):
        ```bash
        # Install nodemon globally or as a dev dependency if you haven't already
        # npm install -g nodemon OR npm install --save-dev nodemon

        # Start with nodemon (if installed)
        nodemon index.js

        # Or start with node
        node index.js
        ```
    *   The backend API should now be running (typically on `http://localhost:5000`).

2.  **Run the Frontend Server:**
    *   Open a **separate** terminal in the project root directory.
    *   Start the Next.js development server:
        ```bash
        npm run dev
        ```
    *   The frontend application should now be running (typically on `http://localhost:3000`).

3.  **Access the Application:**
    *   Open your web browser and navigate to `http://localhost:3000`.
    *   You should see the login/register page.

## API Endpoints (Brief Overview)

*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Log in a user, returns JWT.
*   `GET /api/auth/me`: Get logged-in user details (requires token).
*   `POST /api/tasks`: Create a new task (requires token).
*   `GET /api/tasks`: Get tasks with filtering/searching (requires token).
    *   Query Params: `view`, `status`, `priority`, `search`, `dueDate`
*   `GET /api/tasks/:id`: Get a single task by ID (requires token).
*   `PUT /api/tasks/:id`: Update a task by ID (requires token).
*   `DELETE /api/tasks/:id`: Delete a task by ID (requires token).

## Trade-offs and Decisions

*   **Authentication:** Chose JWT over session-based auth for statelessness, potentially easier scaling, and common use in SPAs. Did not implement refresh tokens for simplicity in this assignment scope.
*   **Database:** Used MongoDB (via Mongoose) as a document database is often suitable for evolving schemas like tasks. PostgreSQL with TypeORM was an alternative considered.
*   **Backend Framework:** Used Express.js for its simplicity and wide adoption. NestJS was considered for its structure but deemed slightly overkill for this assignment's scope.
*   **Frontend State Management:** Used React Context API for global auth state as it's built-in and sufficient for current needs. Zustand or Redux Toolkit could be used for more complex state.
*   **Notifications:** Implemented simple `console.log` placeholders instead of a full email or WebSocket system due to time constraints. WebSockets (Socket.IO) would be ideal for real-time updates.
*   **User Fetching for Assignment:** The modal currently doesn't fetch users for the "Assign To" dropdown. A `/api/users` endpoint would be needed for this.
*   **Error Handling:** Basic error handling is implemented. More granular error handling and user feedback could be added.
*   **Testing:** No automated tests (Unit/Integration) were written due to time constraints. Jest would be a suitable framework.

## Assumptions

*   The user has Node.js, npm, and MongoDB installed or accessible.
*   The backend server runs on port 5000 and the frontend on port 3000 locally.
*   Overdue tasks are determined based on the server's current time compared to the `dueDate`. Timezone differences are not explicitly handled in this basic implementation.
*   For task viewing/editing/deleting, only the user who created the task has permission (this could be expanded based on roles or assignment).

## Deployment

*   **Frontend:** Deployed on [Your Frontend URL - e.g., Vercel/Netlify Link]
*   **Backend:** Deployed on [Your Backend URL - e.g., Render/Railway Link]

*(Replace the bracketed placeholders above with your actual deployment URLs once deployed.)*

## AI Usage Disclosure

*   [Explain how AI tools like ChatGPT, Copilot, etc., were used. Be specific. E.g., "Used ChatGPT to generate boilerplate for the Express server setup.", "Used GitHub Copilot for autocompleting utility functions like `formatDate`.", "Consulted an AI assistant for debugging a specific Mongoose query error."]

*(Fill in the AI usage section based on your actual usage.)*
