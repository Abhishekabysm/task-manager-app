require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import DB connection function

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ extended: false })); // Allow app to accept JSON data

// Define Routes
app.get('/', (req, res) => res.send('API Running'));

// Define API Routes
app.use('/api/auth', require('./routes/auth')); // Mount auth routes
app.use('/api/tasks', require('./routes/tasks')); // Mount task routes
app.use('/api/users', require('./routes/users')); // Add this with your other route registrations
app.use('/api/projects', require('./routes/projects')); // Mount project routes

const PORT = process.env.PORT || 5000; // Use port from env variable or default to 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
