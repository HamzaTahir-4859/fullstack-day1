import apiClient from './apiClient';

export const taskService = {
  // GET request with query parameters and response handling
  getTasks: async () => {
    try {
      const response = await apiClient.get('/todos?_limit=5'); 
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  // POST request passing a request body
  createTask: async (taskData) => {
    try {
      const response = await apiClient.post('/todos', taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }
};