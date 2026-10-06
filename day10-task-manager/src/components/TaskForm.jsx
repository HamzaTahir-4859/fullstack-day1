import { useState } from 'react';

export default function TaskForm({ onAdd }) {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length < 3) {
      setError('Task title must be at least 3 characters long.');
      return;
    }
    // Pass both text and description to the parent
    onAdd(text, description);
    
    // Reset fields
    setText('');
    setDescription('');
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
      <button type="submit">Add Task</button>
      {error && <p className="error-msg">{error}</p>}
    </form>
  );
}