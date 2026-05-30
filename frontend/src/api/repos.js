import api from './axios'

export const syncRepos = () => api.post('/api/repos/sync')
export const getRepos = () => api.get('/api/repos/')
export const connectRepo = (fullName) => api.post(`/api/repos/${fullName}/connect`)
export const getRepoPRs = (fullName) => api.get(`/api/repos/${fullName}/prs`)