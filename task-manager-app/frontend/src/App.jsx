import { useState, useEffect, useCallback } from 'react';
import { taskService } from './api/taskService';
import UserProfile from './components/UserProfile';
import UserChatWidget from './components/UserChatWidget';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/AdminDashboard';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import Notification from './components/Notification';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('access_token'))
  );
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem('user_role') === 'admin'
  );
  // 'login' | 'register' | 'admin-login'
  const [authView, setAuthView] = useState('login');

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);

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
        completed: task.status === 'completed' || Boolean(task.completed),
        completedAt: null,
      }));
      setTasks(formattedTasks);
    } catch (err) {
      setError("We couldn't connect to the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      fetchTasks();
    }
  }, [isAuthenticated, isAdmin, fetchTasks]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const addTask = async (text, description, dueDate) => {
    try {
      const newTaskData = { title: text, description: description || '', status: 'pending' };
      const savedTask = await taskService.addTask(newTaskData);
      const formattedTask = {
        id: savedTask.id,
        text: savedTask.title,
        description: savedTask.description || '',
        dueDate: dueDate || savedTask.dueDate || null,
        completed: savedTask.status === 'completed' || Boolean(savedTask.completed),
        completedAt: null,
      };
      setTasks((prev) => [...prev, formattedTask]);
      showAlert('New task saved to server!', 'success');
    } catch (err) {
      showAlert('Failed to save task to server.', 'error');
    }
  };

  const toggleTask = async (id) => {
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

    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: isNowCompleted, completedAt: newTimestamp }
          : task
      )
    );

    try {
      await taskService.updateTask(id, { status: newStatus });
    } catch (err) {
      showAlert('Failed to sync update with server.', 'error');
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
      await taskService.deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
      showAlert('Task deleted from server.', 'error');
    } catch (err) {
      showAlert('Failed to delete task.', 'error');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ? true : filter === 'completed' ? task.completed : !task.completed;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = tasks.filter((task) => !task.completed).length;

  const handleUserLogin = (userOrUsername) => {
    localStorage.setItem('user_role', 'user');
    setIsAdmin(false);
    setIsAuthenticated(true);
    const displayName =
      typeof userOrUsername === 'object' && userOrUsername !== null
        ? userOrUsername.name || userOrUsername.email
        : userOrUsername || 'User';
    showAlert(`Welcome back, ${displayName}!`, 'success');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setTasks([]);
  };

  // 1. Render Separate Admin Login Page
  if (!isAuthenticated && authView === 'admin-login') {
    return (
      <AdminLoginPage
        onAdminLoginSuccess={handleAdminLogin}
        onBackToUserLogin={() => setAuthView('login')}
      />
    );
  }

  // 2. Render Standard User Login Page (+ Button at top right to switch to Admin Login)
  if (!isAuthenticated && authView === 'login') {
    return (
      <div>
        <div style={{ textAlign: 'right', padding: '16px 24px' }}>
          <button
            onClick={() => setAuthView('admin-login')}
            style={{
              padding: '8px 14px',
              backgroundColor: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            🛡️ Admin Portal Login
          </button>
        </div>
        <LoginPage
          onLogin={handleUserLogin}
          onLoginSuccess={handleUserLogin}
          onSwitchToRegister={() => setAuthView('register')}
        />
      </div>
    );
  }

  // 3. Render Register Page
  if (!isAuthenticated && authView === 'register') {
    return (
      <RegisterPage
        onRegister={handleUserLogin}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  // 4. Render Separate Admin Dashboard (includes multi-user Socket.IO Chat) if logged in as Admin
  if (isAuthenticated && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // 5. Render Standard User Dashboard (includes Profile + Live Admin Support Chat)
  return (
    <div className="app-container">
      <Notification message={alert?.message} type={alert?.type} onClose={() => setAlert(null)} />

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

      {/* Day 32: User Profile Section */}
      <UserProfile />

      {/* Real-Time Socket.IO Support Chat with Admin */}
      <UserChatWidget />

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
          <TaskList tasks={filteredTasks} onToggle={toggleTask} onDelete={deleteTask} />
        )}
      </div>
    </div>
  );
}

export default App;