import TaskForm from './TaskForm'; // Add this line

function App() {
  // This function will receive the validated data from the form
  const handleTaskSubmit = (taskData) => {
    console.log("Form Submitted Successfully!", taskData);
    // Here you would typically save the task to a database or your Day 9 list state
  };

  // Example data to test the "Edit" mode
  const taskToEdit = {
    id: 1,
    title: 'Learn React State',
    category: 'Study'
  };

  return (
    <div>
      <h1>Day 8: Form Implementation</h1>
      
      {/* Testing Add Mode (no existingTask passed) */}
      <TaskForm onSubmit={handleTaskSubmit} />

      {/* Testing Edit Mode (passing existing data) */}
      <TaskForm existingTask={taskToEdit} onSubmit={handleTaskSubmit} />
    </div>
  );
}

export default App;