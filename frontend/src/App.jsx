import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Repositories from './pages/Repositories'
import AIReviews from './pages/AIReviews'
import Analytics from './pages/Analytics'
import PullRequests from './pages/PullRequests'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/reviews" element={<AIReviews />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/pull-requests" element={<PullRequests />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App