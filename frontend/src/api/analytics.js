import api from './axios'

export const getSummary = () => api.get('/api/analytics/summary')
export const getReviewsTrend = () => api.get('/api/analytics/reviews-trend')