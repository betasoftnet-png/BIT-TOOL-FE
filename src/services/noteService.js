const BASE_URL = import.meta.env.VITE_NOTES_API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('bnx_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  // Try to parse JSON for errors too if possible, but fallback to text
  if (!response.ok) {
    let errorMessage = 'API Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }
  
  // Return JSON data
  return response.json();
};

export const noteService = {
  createNote: async (data) => {
    const response = await fetch(`${BASE_URL}/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  getNotes: async (params) => {
    const url = new URL(BASE_URL);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  getNoteById: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },
  
  updateNote: async (id, data) => {
    const response = await fetch(`${BASE_URL}/update/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  deleteNote: async (id) => {
    const response = await fetch(`${BASE_URL}/delete/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};
