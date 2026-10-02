import { useState } from 'react';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', or 'completed'

  // Add a new task
  const addTask = (text) => {
    const newTask = { id: Date.now(), text, completed: false };
    setTasks([...tasks, newTask]);
  };

  // Toggle completion status
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Filter and search logic applied before rendering
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true : 
      filter === 'completed' ? task.completed : 
      !task.completed;
      
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app-container">
      <h1>Task Dashboard</h1>
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
