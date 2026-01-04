import { useState, useEffect, createContext, useContext } from 'react'

// Create Auth Context
const AuthContext = createContext(null)

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem('currentUser')
      }
    }
  }, [])

  const register = async (username, password, additionalData = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.createUser(username, password, additionalData)
      
      if (result.success) {
        setUser(result.user)
        setIsAuthenticated(true)
        localStorage.setItem('currentUser', JSON.stringify(result.user))
      } else {
        setError(result.message)
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Registration failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.authenticateUser(username, password)
      
      if (result.success) {
        setUser(result.user)
        setIsAuthenticated(true)
        localStorage.setItem('currentUser', JSON.stringify(result.user))
      } else {
        setError(result.message)
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('currentUser')
  }

  const updateProfile = async (updates) => {
    if (!user) return { success: false, message: 'No user logged in' }
    
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.updateUserProfile(user.username, updates)
      
      if (result.success) {
        setUser(result.user)
        localStorage.setItem('currentUser', JSON.stringify(result.user))
      } else {
        setError(result.message)
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Update failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (oldPassword, newPassword) => {
    if (!user) return { success: false, message: 'No user logged in' }
    
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.changePassword(
        user.username,
        oldPassword,
        newPassword
      )
      
      if (!result.success) {
        setError(result.message)
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Password change failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (password) => {
    if (!user) return { success: false, message: 'No user logged in' }
    
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.deleteUserAccount(user.username, password)
      
      if (result.success) {
        logout()
      } else {
        setError(result.message)
      }
      
      return result
    } catch (err) {
      const errorMsg = err.message || 'Account deletion failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    deleteAccount
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
