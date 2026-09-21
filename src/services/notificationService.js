const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
    const token = localStorage.getItem('bnx_auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    console.log(`[NotificationService] Received response from ${response.url}:`, response.status);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[NotificationService] API Error:', errorData);
        throw new Error(errorData.message || 'API Request failed');
    }
    const data = await response.json();
    console.log('[NotificationService] API Success Data:', data);
    return data;
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
