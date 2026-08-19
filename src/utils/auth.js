export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

export const getStoredUser = () => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
};

export const setStoredUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const clearStoredUser = () => localStorage.removeItem('user');
