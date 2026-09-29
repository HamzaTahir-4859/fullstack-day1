import { useState } from 'react';
import { Button } from './components/Button';
import { TextInput } from './components/TextInput';
import { Card } from './components/Card';

export default function App() {
  // 1. State
  const [items, setItems] = useState([
    { id: 1, name: 'Learn Props & State', done: true },
    { id: 2, name: 'Build Reusable Components', done: false },
  ]);
  const [itemName, setItemName] = useState('');
  const [inputError, setInputError] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  // 2. Events & Parent/Child Communication handlers
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setInputError('Item name cannot be empty.');
      return;
    }
    setInputError('');
    setItems([...items, { id: Date.now(), name: itemName.trim(), done: false }]);
    setItemName('');
  };

  const handleToggle = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 3. Conditional Rendering list derivation
  const displayedItems = filterActiveOnly ? items.filter(i => !i.done) : items;

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Component Architecture Demo</h2>

      {/* Form using Reusable TextInput & Reusable Button */}
      <form onSubmit={handleAddItem}>
        <TextInput
          label="Add New Task"
          placeholder="e.g., Master conditional rendering"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          error={inputError}
        />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <Button type="submit" variant="primary" size="md">Add Task</Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
          >
            {filterActiveOnly ? 'Show All' : 'Show Pending Only'}
          </Button>
        </div>
      </form>

      {/* Conditional Rendering: Empty State vs List */}
      {displayedItems.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center' }}>No tasks found.</p>
      ) : (
        displayedItems.map((item) => (
          <Card
            key={item.id}
            title={item.name}
            action={
              <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                Delete
              </Button>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => handleToggle(item.id)}
              />
              <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#9ca3af' : '#111827' }}>
                {item.done ? 'Status: Completed' : 'Status: In Progress'}
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}