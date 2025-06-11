const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

let server; // Declare server at a higher scope

// MongoDB Connection and Server Start
if (process.env.NODE_ENV !== 'test') {
  const MONGODB_URI_ACTUAL = process.env.MONGODB_URI || 'mongodb://mongo:27017/mydatabase';

  if (!MONGODB_URI_ACTUAL) {
    console.error("MongoDB URI is not defined. Please set MONGODB_URI environment variable for non-test environments.");
    process.exit(1);
  }

  mongoose.connect(MONGODB_URI_ACTUAL)
    .then(() => {
      console.log('Connected to MongoDB for non-test environment');
      server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB in non-test environment:', err.message);
      process.exit(1);
    });

  const db = mongoose.connection;
  db.on('error', (err) => {
    console.error('MongoDB runtime connection error (non-test):', err.message);
  });
  // The db.once('open') for console logging is covered by the .then() block now.
}
// In test mode, mongoose connection is handled by tests/setup.js.
// The server is not started here; supertest will handle it using the 'app' instance.
// The mongoose instance used by models in server.js will be the one connected by setup.js.

// Define Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);


// API Routes
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Health check

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Users API
app.get('/api/users', async (req, res) => {
  console.log('GET /api/users called');
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  console.log(`GET /api/users/${req.params.id} called`);
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  console.log('POST /api/users called');
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tasks API
app.get('/api/tasks', async (req, res) => {
  console.log('GET /api/tasks called');
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  console.log(`GET /api/tasks/${req.params.id} called`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  console.log('POST /api/tasks called');
  const { title, userId } = req.body;
  if (!title || !userId) {
    return res.status(400).json({ error: 'Title and userId are required' });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId format' });
  }
  
  try {
    const newTask = new Task({ title, completed: false, userId });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  console.log(`PUT /api/tasks/${req.params.id} called`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  console.log(`DELETE /api/tasks/${req.params.id} called`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = { app, server, mongoose };
