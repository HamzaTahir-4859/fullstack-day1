import React, { useState, useEffect } from 'react';

const TaskForm = ({ existingTask, onSubmit }) => {
  // 1. Form State
  const initialFormState = {
    title: '',
    category: '',
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // 2. Add/Edit Handling: Populate form if an existing task is passed
  useEffect(() => {
    if (existingTask) {
      setFormData(existingTask);
    } else {
      setFormData(initialFormState);
    }
  }, [existingTask]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear the error for a field once the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // 3. Validation & Error Messages
  const validateForm = () => {
    let newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    // Return true if no errors exist
    return Object.keys(newErrors).length === 0; 
  };

  // 4. Submit Handling
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form if it's a new task (optional depending on UX)
      if (!existingTask) {
        setFormData(initialFormState);
      }
    }
  };

  // 5. Reset Handling
  const handleReset = () => {
    setFormData(existingTask ? existingTask : initialFormState);
    setErrors({});
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>{existingTask ? 'Edit Task' : 'Add New Task'}</h2>
      
      <form onSubmit={handleSubmit} onReset={handleReset}>
        
        {/* Title Input */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Task Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
        </div>

        {/* Category Input */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">-- Select Category --</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Study">Study</option>
          </select>
          {errors.category && <span style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '8px 15px', backgroundColor: 'blue', color: 'white', border: 'none' }}>
            {existingTask ? 'Update Task' : 'Save Task'}
          </button>
          <button type="reset" style={{ padding: '8px 15px' }}>
            Reset
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default TaskForm;