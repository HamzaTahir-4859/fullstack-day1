import { useState } from 'react';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  // 1. Pre-populated tasks so the dashboard isn't empty
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review React state and props', completed: true },
    { id: 2, text: 'Push Day 10 dashboard to GitHub', completed: false },
    { id: 3, text: 'Prepare for backend API integration', completed: false }
  ]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // 2. Generate a formatted dynamic date (e.g., "Friday, October 2")
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const addTask = (text) => {
    const newTask = { id: Date.now(), text, completed: false };
    setTasks([...tasks, newTask]);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
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

  // Calculate pending tasks for the new stat badge
  const pendingCount = tasks.filter(task => !task.completed).length;

  return (
    <div className="app-container">
      {/* 3. New Dashboard Header */}
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
      <TaskList 
        tasks={filteredTasks} 
        onToggle={toggleTask} 
        onDelete={deleteTask} 
      />
    </div>
  );
}

export default App;