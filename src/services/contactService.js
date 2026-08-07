const API_BASE_URL = import.meta.env.VITE_CONTACT_API_BASE_URL;

const getHeaders = () => {
    const token = localStorage.getItem('bnx_auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const contactService = {
    async getContacts(offset = 0) {
        try {
            const response = await fetch(`${API_BASE_URL}/get`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching contacts:', error);
            throw error;
        }
    },

    async getAllContacts() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-all`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching all contacts:', error);
            throw error;
        }
    },

    async getContact(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/get/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching contact:', error);
            throw error;
        }
    },

    async createContact(contactData) {
        try {
            const response = await fetch(`${API_BASE_URL}/add`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(contactData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating contact:', error);
            throw error;
        }
    },

    async updateContact(id, contactData) {
        try {
            const response = await fetch(`${API_BASE_URL}/update/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(contactData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating contact:', error);
            throw error;
        }
    },

    async deleteContact(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting contact:', error);
            throw error;
        }
    }
};
