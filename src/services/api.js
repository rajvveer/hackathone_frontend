import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    timeout: 60000, // 60 second timeout for AI operations
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============ AUTH API ============
export const authAPI = {
    register: (name, email, password) =>
        api.post('/auth/register', { name, email, password }),

    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    forgotPassword: (email) =>
        api.post('/auth/forgot-password', { email }),

    verifyOtp: (email, otp) =>
        api.post('/auth/verify-otp', { email, otp }),

    resetPassword: (email, otp, newPassword) =>
        api.post('/auth/reset-password', { email, otp, newPassword }),
};

// ============ USER API ============
export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (profileData) => api.put('/user/profile', profileData),
    deleteAccount: () => api.delete('/user/account'),
};

// ============ DASHBOARD API ============
export const dashboardAPI = {
    getStats: () => api.get('/dashboard'),
};

// ============ AI CHAT API ============
export const chatAPI = {
    sendMessage: (message, conversationId) =>
        api.post('/ai/chat', { message, conversation_id: conversationId }),

    // Streaming version using SSE with action support
    sendMessageStream: async (message, conversationId, onChunk, onDone, onError, onAction) => {
        const token = localStorage.getItem('token');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

        try {
            const response = await fetch('/api/ai/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message, conversation_id: conversationId }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Stream request failed');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let conversationIdFromStream = null;
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'start') {
                                conversationIdFromStream = data.conversation_id;
                            } else if (data.type === 'chunk') {
                                onChunk(data.content, conversationIdFromStream);
                            } else if (data.type === 'action' && onAction) {
                                onAction(data);
                            } else if (data.type === 'done') {
                                onDone(data.full_content, conversationIdFromStream, data.actions || []);
                                return; // Exit successfully
                            } else if (data.type === 'error') {
                                onError(data.message);
                                return;
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', e);
                        }
                    }
                }
            }
        } catch (err) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                onError('Request timed out. Please try again.');
            } else {
                onError(err.message || 'Connection failed');
            }
        }
    },

    // Conversation management
    getConversations: () => api.get('/ai/conversations'),

    createConversation: () => api.post('/ai/conversations/new'),

    loadConversation: (id) => api.get(`/ai/conversations/${id}`),

    deleteConversation: (id) => api.delete(`/ai/conversations/${id}`),

    // Legacy
    getConversation: (id) => api.get(`/ai/conversation/${id}`),
    clearConversation: (id) => api.delete(`/ai/conversation/${id}`),
};

// ============ RECOMMENDATIONS API ============
export const recommendationsAPI = {
    get: () => api.get('/recommendations'),
    refresh: () => api.post('/recommendations/refresh'),
};

// ============ SHORTLIST API ============
export const shortlistAPI = {
    get: () => api.get('/shortlist'),

    add: (universityData) => api.post('/shortlist', universityData),

    remove: (id) => api.delete(`/shortlist/${id}`),

    lock: (shortlistId) => api.post('/shortlist/lock', { shortlist_id: shortlistId }),

    unlock: () => api.post('/shortlist/unlock'),
};

// ============ TASKS API ============
export const tasksAPI = {
    getAll: () => api.get('/tasks'),

    create: (taskData) => api.post('/tasks', taskData),

    update: (id, taskData) => api.put(`/tasks/${id}`, taskData),

    markComplete: (id) => api.patch(`/tasks/${id}/complete`),

    markPending: (id) => api.patch(`/tasks/${id}/pending`),

    delete: (id) => api.delete(`/tasks/${id}`),
};

// ============ APPLICATION API ============
export const applicationAPI = {
    getGuidance: () => api.get('/application/guidance'),
};

// ============ UNIVERSITY SEARCH API ============
export const universityAPI = {
    search: (query) => api.get('/universities/search', { params: { q: query } }),
};

export default api;
