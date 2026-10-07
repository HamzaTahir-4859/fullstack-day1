import axios from 'axios';

const BASE_URL = 'https://jsonplaceholder.typicode.com/todos';

export const taskService = {
  // Read (GET) - Fetches the initial 5 tasks
  getTasks: async () => {
    const response = await axios.get(`${BASE_URL}?_limit=5`);
    return response.data;
  },
  
  // Create (POST) - Adds a new task to the server
  addTask: async (taskData) => {
    const response = await axios.post(BASE_URL, taskData);
    return response.data;
  },
  
  // Update (PATCH) - Modifies an existing task (like toggling completion)
  updateTask: async (id, updates) => {
    const response = await axios.patch(`${BASE_URL}/${id}`, updates);
    return response.data;
  },
  
  // Delete (DELETE) - Removes a task from the server
  deleteTask: async (id) => {
    await axios.delete(`${BASE_URL}/${id}`);
  }
};