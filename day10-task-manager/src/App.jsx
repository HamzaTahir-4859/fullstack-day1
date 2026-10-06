import { useState, useEffect } from 'react';
import { taskService } from './api/taskService';
import LoginPage from './components/LoginPage';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAPI = async () => {
      try {
        const data = await taskService.getTasks();
        const formattedTasks = data.map(task => ({
          id: task.id,
          text: task.title,
          description: task.description || '', // Safe fallback if API lacks description
          completed: task.completed,
          completedAt: null
        }));
        setTasks(formattedTasks);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAPI();
  }, [isAuthenticated]);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const addTask = (text, description) => {
    const newTask = { 
      id: Date.now(), 
      text, 
      description,
      completed: false, 
      completedAt: null 
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const isNowCompleted = !task.completed;
        return { 
          ...task, 
          completed: isNowCompleted,
          completedAt: isNowCompleted 
            ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) 
            : null
        };
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true : 
      filter === 'completed' ? task.completed : 
      !task.completed;
      
    return matchesSearch && matchesFilter;
  });

  const pendingCount = tasks.filter(task => !task.completed).length;

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div>
          <h1>Task Dashboard</h1>
          <p className="date-display">{today}</p>
        </div>
        <div className="task-stats">
          <span>{pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} pending</span>
        </div>
      </header>

      <TaskForm onAdd={addTask} />
      <FilterBar 
        search={searchQuery} 
        onSearchChange={setSearchQuery} 
        filter={filter} 
        onFilterChange={setFilter} 
      />
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666', fontWeight: '500' }}>
          Loading tasks from API...
        </div>
      ) : (
        <TaskList 
          tasks={filteredTasks} 
          onToggle={toggleTask} 
          onDelete={deleteTask} 
        />
      )}
    </div>
  );
}

export default App;