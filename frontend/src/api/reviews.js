import api from './axios'

export const getReviews = () => api.get('/api/reviews/')
export const triggerManualReview = (data) => api.post(
  `/api/webhooks/manual-review?repo_full_name=${data.repo_full_name}&pr_number=${data.pr_number}&pr_title=${encodeURIComponent(data.pr_title)}&pr_url=${data.pr_url}`
)