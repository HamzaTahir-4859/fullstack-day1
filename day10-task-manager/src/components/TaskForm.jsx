import { useState } from 'react';

export default function TaskForm({ onAdd }) {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(''); // New state for time limit
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length < 3) {
      setError('Task title must be at least 3 characters long.');
      return;
    }
    // Pass dueDate along with text and description
    onAdd(text, description, dueDate);
    
    // Reset all fields
    setText('');
    setDescription('');
    setDueDate('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input 
        type="text" 
        placeholder="Add a new task title..." 
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="task-input"
      />
      <textarea 
        placeholder="Add a task description (optional)..." 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="task-textarea"
        rows="2"
      ></textarea>
      
      {/* New Due Date Input */}
      <input 
        type="datetime-local" 
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="task-input"
      />
      
      <button type="submit">Add Task</button>
      {error && <p className="error-msg">{error}</p>}
    </form>
  );
}