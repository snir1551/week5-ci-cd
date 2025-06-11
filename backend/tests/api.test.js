const request = require('supertest');
const { app, mongoose } = require('../server'); // Import mongoose for direct interaction if needed
const User = mongoose.model('User');
const Task = mongoose.model('Task');

describe('API Tests', () => {
  describe('Health Check', () => {
    test('GET /api/health should return OK status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Users API', () => {
    let testUser;

    beforeEach(async () => {
      // Create a user for tests that require an existing user
      testUser = await new User({ name: 'Initial User', email: 'initial@example.com' }).save();
    });

    test('GET /api/users should return all users', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Check if the testUser is present (or any user if that's the expectation)
      expect(response.body.length).toBeGreaterThan(0); 
      expect(response.body.some(user => user.email === 'initial@example.com')).toBe(true);
    });

    test('GET /api/users/:id should return specific user', async () => {
      const response = await request(app).get(`/api/users/${testUser._id}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testUser._id.toString());
      expect(response.body.name).toBe('Initial User');
    });

    test('GET /api/users/:id should return 404 for non-existent user', async () => {
      const nonExistentId = new mongoose.Types.ObjectId(); // Generate a valid but non-existent ObjectId
      const response = await request(app).get(`/api/users/${nonExistentId}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    test('GET /api/users/:id should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/users/invalididformat');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid user ID format');
    });

    test('POST /api/users should create new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };
      const response = await request(app)
        .post('/api/users')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
      expect(response.body._id).toBeDefined(); // MongoDB uses _id
    });

    test('POST /api/users should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test User' }); // missing email
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and email are required');
    });
  });

  describe('Tasks API', () => {
    let testUserForTasks;
    let testTask;

    beforeEach(async () => {
      testUserForTasks = await new User({ name: 'Task User', email: 'taskuser@example.com' }).save();
      testTask = await new Task({ title: 'Initial Task', userId: testUserForTasks._id, completed: false }).save();
    });

    test('GET /api/tasks should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some(task => task.title === 'Initial Task')).toBe(true);
    });

    test('GET /api/tasks/:id should return specific task', async () => {
      const response = await request(app).get(`/api/tasks/${testTask._id}`);
      expect(response.status).toBe(200);
      expect(response.body._id).toBe(testTask._id.toString());
    });

    test('GET /api/tasks/:id should return 404 for non-existent task', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/tasks/${nonExistentId}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
    
    test('GET /api/tasks/:id should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/tasks/invalididformat');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid task ID format');
    });

    test('POST /api/tasks should create new task', async () => {
      const newTask = {
        title: 'Test Task',
        userId: testUserForTasks._id // Use the ID of the created user
      };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.userId).toBe(newTask.userId.toString());
      expect(response.body.completed).toBe(false);
    });

    test('POST /api/tasks should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task Only' }); // missing userId
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and userId are required');
    });

    test('POST /api/tasks should return 400 for invalid userId format', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', userId: 'invaliduserid' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid userId format');
    });


    test('PUT /api/tasks/:id should update task', async () => {
      const updateData = { completed: true };
      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    test('DELETE /api/tasks/:id should delete task', async () => {
      const response = await request(app).delete(`/api/tasks/${testTask._id}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
    });
  });
});
