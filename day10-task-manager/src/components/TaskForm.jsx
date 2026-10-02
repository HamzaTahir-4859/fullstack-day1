import { useState } from 'react';

export default function TaskForm({ onAdd }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents page reload
    
    // Validation
    if (text.trim().length < 3) {
      setError('Task must be at least 3 characters long.');
      return;
    }

    onAdd(text.trim());
    setText(''); // Reset input
    setError(''); // Clear error
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="input-group">
        <input 
          type="text" 
          placeholder="Add a new task..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <button type="submit">Add Task</button>
      </div>
      {error && <p className="error-msg">{error}</p>}
    </form>
  );
}