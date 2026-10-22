import { useState, useEffect, useCallback } from 'react';
import { taskService } from './api/taskService';
import UserProfile from './components/UserProfile';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import Notification from './components/Notification';
import './App.css';

function App() {
  // Auth State (Automatically checks if JWT token already exists)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('access_token'))
  );
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  // Data State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  // Helper to trigger alerts
  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks();
      const formattedTasks = data.map((task) => ({
        id: task.id,
        text: task.title,
        description: task.description || '',
        dueDate: task.dueDate || null,
        // Supports both NestJS Prisma status ('completed'/'pending') and boolean completed
        completed: task.status === 'completed' || Boolean(task.completed),
        completedAt: null,
      }));
      setTasks(formattedTasks);
      showAlert('Tasks loaded successfully from the server.', 'success');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError("We couldn't connect to the server. Please check your connection.");
      showAlert('Failed to connect to the server.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, fetchTasks]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const addTask = async (text, description, dueDate) => {
    try {
      // Structure the data for NestJS CreateTaskDto (title, description, status)
      const newTaskData = {
        title: text,
        description: description || '',
        status: 'pending',
      };

      // Send the POST request to the server
      const savedTask = await taskService.addTask(newTaskData);

      // Update the UI using the ID and data returned by the database
      const formattedTask = {
        id: savedTask.id,
        text: savedTask.title,
        description: savedTask.description || '',
        dueDate: dueDate || savedTask.dueDate || null,
        completed: savedTask.status === 'completed' || Boolean(savedTask.completed),
        completedAt: null,
      };

      setTasks((prevTasks) => [...prevTasks, formattedTask]);
      showAlert('New task saved to server!', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Failed to save task to server.', 'error');
    }
  };

  const toggleTask = async (id) => {
    // Find the target task and determine its new state
    const taskToUpdate = tasks.find((t) => t.id === id);
    if (!taskToUpdate) return;

    const isNowCompleted = !taskToUpdate.completed;
    const newStatus = isNowCompleted ? 'completed' : 'pending';
    const newTimestamp = isNowCompleted
      ? new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : null;

    // Optimistically update the UI immediately
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: isNowCompleted, completedAt: newTimestamp }
          : task
      )
    );

    try {
      // Fire the PATCH request in the background using NestJS UpdateTaskDto format
      await taskService.updateTask(id, { status: newStatus });
    } catch (err) {
      console.error(err);
      showAlert('Failed to sync update with server.', 'error');
      // Revert UI change if API fails
      setTasks(
        tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !isNowCompleted,
                completedAt: taskToUpdate.completedAt,
              }
            : task
        )
      );
    }
  };

  const deleteTask = async (id) => {
    try {
      // Tell the server to delete it
      await taskService.deleteTask(id);

      // Remove it from the screen if the server succeeded
      setTasks(tasks.filter((task) => task.id !== id));
      showAlert('Task deleted from server.', 'error');
    } catch (err) {
      console.error(err);
      showAlert('Failed to delete task.', 'error');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'completed'
        ? task.completed
        : !task.completed;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = tasks.filter((task) => !task.completed).length;

  const handleLogin = (userOrUsername) => {
    const displayName =
      typeof userOrUsername === 'object' && userOrUsername !== null
        ? userOrUsername.name || userOrUsername.email
        : userOrUsername || 'User';
    setIsAuthenticated(true);
    showAlert(`Welcome back, ${displayName}!`, 'success');
  };

  const handleRegister = (userOrUsername) => {
    const displayName =
      typeof userOrUsername === 'object' && userOrUsername !== null
        ? userOrUsername.name || userOrUsername.email
        : userOrUsername || 'User';
    setIsAuthenticated(true);
    showAlert(`Account created! Welcome, ${displayName}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setTasks([]);
    showAlert('Logged out successfully.', 'success');
  };

  // Render Authentication Gates
  if (!isAuthenticated && authView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onLoginSuccess={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  if (!isAuthenticated && authView === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Render the Alert Toast if it exists */}
      <Notification
        message={alert?.message}
        type={alert?.type}
        onClose={() => setAlert(null)}
      />

      <header className="dashboard-header">
        <div>
          <h1>Task Dashboard</h1>
          <p className="date-display">{today}</p>
        </div>
        <div className="task-stats" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            {pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} pending
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: '1px solid #dc3545',
              backgroundColor: '#fff',
              color: '#dc3545',
              fontWeight: 'bold',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Day 32: User Profile Section (View, Add Picture, Edit Name & Bio) */}
      <UserProfile />

      <TaskForm onAdd={addTask} />
      <FilterBar
        search={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="api-state-container">
        {loading && (
          <div className="state-message loading">
            <span className="spinner"></span> Loading your tasks...
          </div>
        )}

        {error && !loading && (
          <div className="state-message error">
            <p>⚠️ {error}</p>
            <button onClick={fetchTasks} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="state-message empty">
            <p>No tasks found from the server. Create your first task above!</p>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        )}
      </div>
    </div>
  );
}

export default App;