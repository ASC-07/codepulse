import api from './axios'

export const getMe = () => api.get('/api/auth/me')
export const logout = () => api.post('/api/auth/logout')