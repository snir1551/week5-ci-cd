import React, { useState, useEffect } from 'react';
import UserList from './components/UserList';
import TaskList from './components/TaskList';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('tasks');
  const [serverStatus, setServerStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      await apiService.healthCheck();
      setServerStatus('Connected');
    } catch (error) {
      setServerStatus('Disconnected');
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Demo Task Manager</h1>
        <div className="server-status">
          <span className={`status-indicator ${serverStatus.toLowerCase()}`}></span>
          Backend: {serverStatus}
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'users' ? <UserList /> : <TaskList />}
      </main>

      <footer className="app-footer">
        <p>Demo Full-Stack Application - Node.js Backend + React Frontend</p>
      </footer>
    </div>
  );
}

export default App;
