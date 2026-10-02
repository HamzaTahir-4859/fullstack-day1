export default function TaskList({ tasks, onToggle, onDelete }) {
  // Empty State
  if (tasks.length === 0) {
    return <p className="empty-state">No tasks found. You're all caught up!</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          <label className="task-label">
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => onToggle(task.id)} 
            />
            <span>{task.text}</span>
          </label>
          <button onClick={() => onDelete(task.id)} className="delete-btn">Delete</button>
        </li>
      ))}
    </ul>
  );
}