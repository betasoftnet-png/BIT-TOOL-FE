const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
    const token = localStorage.getItem('bnx_auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API Request failed');
    }
    return response.json();
};

export const notificationService = {
    // Get all notifications for current user
    getNotifications: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'GET',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Mark a single notification as read
    markAsRead: async (id) => {
        const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};
