import React, { useState, useEffect } from 'react';
import { Task, User, apiService } from '../services/api';
import './TaskList.css';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', userId: 1 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, usersResponse] = await Promise.all([
        apiService.getTasks(),
        apiService.getUsers()
      ]);
      setTasks(tasksResponse.data);
      setUsers(usersResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createTask(newTask);
      setTasks([...tasks, response.data]);
      setNewTask({ title: '', userId: 1 });
      setShowForm(false);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const response = await apiService.updateTask(task.id, {
        completed: !task.completed
      });
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2>Tasks</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showForm && (
        <form className="task-form" onSubmit={handleCreateTask}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <select
              value={newTask.userId}
              onChange={(e) => setNewTask({ ...newTask, userId: parseInt(e.target.value) })}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-success">Create Task</button>
        </form>
      )}

      <div className="tasks-grid">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
            <div className="task-content">
              <h3>{task.title}</h3>
              <p>Assigned to: {getUserName(task.userId)}</p>
              <p className="task-status">
                Status: {task.completed ? 'Completed' : 'Pending'}
              </p>
            </div>
            <div className="task-actions">
              <button
                className={`btn ${task.completed ? 'btn-warning' : 'btn-success'}`}
                onClick={() => handleToggleTask(task)}
              >
                {task.completed ? 'Mark Pending' : 'Mark Complete'}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
