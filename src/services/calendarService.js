const API_BASE_URL = 'https://api.bit-tool.com/api/calendar';

const getHeaders = () => {
    const token = localStorage.getItem('bnx_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API Request failed');
    }
    return response.json();
};

export const calendarService = {
    // Search
    search: async (query, params = {}) => {
        const urlParams = new URLSearchParams({ query, ...params });
        const response = await fetch(`${API_BASE_URL}/search?${urlParams.toString()}`, { headers: getHeaders() });
        return handleResponse(response);
    },

    // Categories
    getCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/categories`, { headers: getHeaders() });
        return handleResponse(response);
    },
    createCategory: async (data) => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    // Events
    getEventsByMonth: async (year, month) => {
        const response = await fetch(`${API_BASE_URL}/events/month?year=${year}&month=${month}`, { headers: getHeaders() });
        return handleResponse(response);
    },
    createEvent: async (data) => {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    updateEvent: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    deleteEvent: async (id) => {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Notes
    getNotesByDate: async (date) => {
        const response = await fetch(`${API_BASE_URL}/notes?date=${date}`, { headers: getHeaders() });
        return handleResponse(response);
    },
    createNote: async (data) => {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    updateNote: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    deleteNote: async (id) => {
        const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Reminders
    getRemindersByDate: async (date) => {
        const response = await fetch(`${API_BASE_URL}/reminders?date=${date}`, { headers: getHeaders() });
        return handleResponse(response);
    },
    createReminder: async (data) => {
        const response = await fetch(`${API_BASE_URL}/reminders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    updateReminder: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    deleteReminder: async (id) => {
        const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    completeReminder: async (id) => {
        const response = await fetch(`${API_BASE_URL}/reminders/${id}/complete`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};
