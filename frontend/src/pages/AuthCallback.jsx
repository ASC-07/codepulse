import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const search = window.location.search

    // Try hash first, then query params
    const params = hash 
      ? new URLSearchParams(hash)
      : new URLSearchParams(search)

    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    console.log('Access token found:', !!accessToken)

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      // Use window.location instead of navigate to force full redirect
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/login'
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#7F77DD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8a8a9a]">Signing you in...</p>
      </div>
    </div>
  )
}