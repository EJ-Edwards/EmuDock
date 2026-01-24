import { useState, useEffect, createContext, useContext } from 'react'
import { auth } from '../config/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth'

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

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        }
        setUser(userData)
        setIsAuthenticated(true)
        setLoading(false)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const register = async (email, password, displayName = '') => {
    setLoading(true)
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name if provided
      if (displayName) {
        await firebaseUpdateProfile(userCredential.user, { displayName })
      }
      
      return { success: true, user: userCredential.user }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (err) {
      const errorMsg = err.message || 'Login failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setIsAuthenticated(false)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const updateProfile = async (updates) => {
    if (!auth.currentUser) return { success: false, message: 'No user logged in' }
    
    setLoading(true)
    setError(null)
    try {
      await firebaseUpdateProfile(auth.currentUser, updates)
      setUser({ ...user, ...updates })
      return { success: true }
    } catch (err) {
      const errorMsg = err.message || 'Update failed'
      setError(errorMsg)
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (oldPassword, newPassword) => {
    // Note: Firebase requires re-authentication before password change
    // You'll need to implement reauthenticateWithCredential
    return { success: false, message: 'Password change requires re-authentication' }
  }

  const deleteAccount = async () => {
    if (!auth.currentUser) return { success: false, message: 'No user logged in' }
    
    setLoading(true)
    setError(null)
    try {
      await auth.currentUser.delete()
      logout()
      return { success: true }
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
