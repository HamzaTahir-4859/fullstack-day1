import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com', // Replace with your actual backend API URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;