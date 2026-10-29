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

// Built-in Payment Page Component (No separate file required!)
function PaymentPage({ onBack }) {
  const [amount, setAmount] = useState('25');
  const [method, setMethod] = useState('Credit / Debit Card');
  const [description, setDescription] = useState('Pro Task Workspace Subscription');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [payments, setPayments] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('access_token');

  const fetchPayments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/auth/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  async function handlePayAdmin(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    setStatusMsg('');

    try {
      const res = await fetch('http://localhost:3000/auth/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          description,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg(`✅ Payment of $${amount} sent to Admin!`);
        fetchPayments();
      } else {
        setStatusMsg(`❌ Payment failed: ${data.message}`);
      }
    } catch (err) {
      setStatusMsg('❌ Network error sending payment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '750px',
        margin: '30px auto',
        padding: '24px',
        border: '1px solid #ddd',
        borderRadius: '12px',
        backgroundColor: '#fff',
        color: '#1e293b',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>💳 Pay Admin Portal</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
            Send instant payments or subscription fees directly to the System Administrator
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ← Back to Tasks
          </button>
        )}
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            backgroundColor: '#e6ffed',
            color: '#006622',
            border: '1px solid #8cd9a0',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {statusMsg}
        </div>
      )}

      <form
        onSubmit={handlePayAdmin}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '24px',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontWeight: 'bold',
            }}
          >
            Amount (USD $)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontWeight: 'bold',
            }}
          >
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
          >
            <option value="Credit / Debit Card">Credit / Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="NayaPay / Digital Wallet">NayaPay / Digital Wallet</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontWeight: 'bold',
            }}
          >
            Card / Account Reference
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '6px',
              fontWeight: 'bold',
            }}
          >
            Payment Note / Purpose
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Processing Payment...' : `💸 Pay $${amount} to Admin Now`}
          </button>
        </div>
      </form>

      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🧾 Your Payment History</h3>
      {payments.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '14px' }}>No payments made yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '8px' }}>ID</th>
              <th style={{ padding: '8px' }}>Amount</th>
              <th style={{ padding: '8px' }}>Method</th>
              <th style={{ padding: '8px' }}>Description</th>
              <th style={{ padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px' }}>#{p.id}</td>
                <td style={{ padding: '8px', fontWeight: 'bold', color: '#16a34a' }}>${p.amount}</td>
                <td style={{ padding: '8px' }}>{p.method}</td>
                <td style={{ padding: '8px' }}>{p.description}</td>
                <td style={{ padding: '8px' }}>
                  <span
                    style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                    }}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('access_token'))
  );
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem('user_role') === 'admin'
  );
  const [authView, setAuthView] = useState('login');
  const [showPaymentPage, setShowPaymentPage] = useState(false);

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
      const newTaskData = {
        title: text,
        description: description || '',
        status: 'pending',
      };
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

  const handleUserLogin = (userOrUsername) => {
    localStorage.setItem('user_role', 'user');
    setIsAdmin(false);
    setIsAuthenticated(true);
    setShowPaymentPage(false);
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
    setShowPaymentPage(false);
    setTasks([]);
  };

  if (!isAuthenticated && authView === 'admin-login') {
    return (
      <AdminLoginPage
        onAdminLoginSuccess={handleAdminLogin}
        onBackToUserLogin={() => setAuthView('login')}
      />
    );
  }

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

  if (!isAuthenticated && authView === 'register') {
    return (
      <RegisterPage
        onRegister={handleUserLogin}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  if (isAuthenticated && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (isAuthenticated && showPaymentPage) {
    return <PaymentPage onBack={() => setShowPaymentPage(false)} />;
  }

  return (
    <div className="app-container">
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
        <div
          className="task-stats"
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <span>
            {pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} pending
          </span>

          <button
            onClick={() => setShowPaymentPage(true)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#16a34a',
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            💳 Pay Admin
          </button>

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

      <UserProfile />
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