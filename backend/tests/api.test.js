const request = require('supertest');
const { app } = require('../server');

describe('API Tests', () => {
  describe('Health Check', () => {
    test('GET /api/health should return OK status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Users API', () => {
    test('GET /api/users should return all users', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/users/:id should return specific user', async () => {
      const response = await request(app).get('/api/users/1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('John Doe');
    });

    test('GET /api/users/:id should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/999');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
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
      expect(response.body.id).toBeDefined();
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
    test('GET /api/tasks should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/tasks/:id should return specific task', async () => {
      const response = await request(app).get('/api/tasks/1');
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
    });

    test('POST /api/tasks should create new task', async () => {
      const newTask = {
        title: 'Test Task',
        userId: 1
      };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask);
      
      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newTask.title);
      expect(response.body.userId).toBe(newTask.userId);
      expect(response.body.completed).toBe(false);
    });

    test('PUT /api/tasks/:id should update task', async () => {
      const updateData = { completed: true };
      const response = await request(app)
        .put('/api/tasks/1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });

    test('DELETE /api/tasks/:id should delete task', async () => {
      const response = await request(app).delete('/api/tasks/1');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
    });
  });
});
