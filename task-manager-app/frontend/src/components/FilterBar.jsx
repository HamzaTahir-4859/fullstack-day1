export default function FilterBar({ search, onSearchChange, filter, onFilterChange }) {
  return (
    <div className="filter-bar">
      <input 
        type="text" 
        placeholder="Search tasks..." 
        value={search} 
        onChange={(e) => onSearchChange(e.target.value)} 
        className="search-input"
      />
      <select 
        value={filter} 
        onChange={(e) => onFilterChange(e.target.value)} 
        className="filter-select"
      >
        <option value="all">All Tasks</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}