export default function TaskList({ tasks, onToggle, onDelete }) {
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
            <div className="task-text-wrapper">
              <span className="task-title">{task.text}</span>
              
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              
              {/* Display the due date with time pushed to the right */}
              {task.dueDate && !task.completed && (
                <div className="task-due-date">
                  <span>
                    🗓️ Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric'
                    })}
                  </span>
                  <span className="due-time">
                    {new Date(task.dueDate).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {task.completed && task.completedAt && (
                <span className="timestamp">Completed at {task.completedAt}</span>
              )}
            </div>
          </label>
          <button onClick={() => onDelete(task.id)} className="delete-btn">Delete</button>
        </li>
      ))}
    </ul>
  );
}