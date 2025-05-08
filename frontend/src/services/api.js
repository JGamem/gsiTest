import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Board API
export const boardsApi = {
    getBoards: () => apiClient.get('/kanban/boards/'),
    getBoard: (id) => apiClient.get(`/kanban/boards/${id}`),
    createBoard: (data) => apiClient.post('/kanban/boards/', data),
    updateBoard: (id, data) => apiClient.put(`/kanban/boards/${id}`, data),
    deleteBoard: (id) => apiClient.delete(`/kanban/boards/${id}`),
};

// Column API
export const columnsApi = {
    getColumns: (boardId) => apiClient.get(`/kanban/boards/${boardId}/columns/`),
    createColumn: (data) => apiClient.post('/kanban/columns/', data),
    updateColumn: (id, data) => apiClient.put(`/kanban/columns/${id}`, data),
    deleteColumn: (id) => apiClient.delete(`/kanban/columns/${id}`),
};

// Task API
export const tasksApi = {
    getTasks: (columnId) => apiClient.get(`/kanban/tasks/?column_id=${columnId}`),
    getAllTasks: () => apiClient.get('/kanban/tasks/all'),
    getTask: (id) => apiClient.get(`/kanban/tasks/${id}`),
    createTask: (data) => apiClient.post('/kanban/tasks/', data),
    updateTask: (id, data) => apiClient.put(`/kanban/tasks/${id}`, data),
    deleteTask: (id) => apiClient.delete(`/kanban/tasks/${id}`),
};

// Tag API
export const tagsApi = {
    getTags: () => apiClient.get('/kanban/tags/'),
    createTag: (data) => apiClient.post('/kanban/tags/', data),
    addTagToTask: (taskId, tagId) => apiClient.post(`/kanban/tasks/${taskId}/tags/${tagId}`),
    removeTagFromTask: (taskId, tagId) => apiClient.delete(`/kanban/tasks/${taskId}/tags/${tagId}`),
};

export default {
    boards: boardsApi,
    columns: columnsApi,
    tasks: tasksApi,
    tags: tagsApi,
};