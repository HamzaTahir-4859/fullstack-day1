import { useState } from 'react';

export default function TaskForm({ onAdd }) {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  // Helper to get the current local time in YYYY-MM-DDTHH:MM format for the 'min' attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length < 3) {
      setError('Task title must be at least 3 characters long.');
      return;
    }
    
    onAdd(text, description, dueDate);
    
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
      
      {/* Upgraded Date Input Wrapper */}
      <div className="date-input-wrapper">
        <span className="calendar-icon">📅</span>
        <input 
          type="datetime-local" 
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={getCurrentDateTime()} 
          className="task-input date-input"
        />
      </div>
      
      <button type="submit">Add Task</button>
      {error && <p className="error-msg">{error}</p>}
    </form>
  );
}