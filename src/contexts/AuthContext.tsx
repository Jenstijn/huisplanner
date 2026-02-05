import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

// Type definitie voor de auth context
interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

// Maak de context
const AuthContext = createContext<AuthContextType | null>(null)

// Provider component die auth state beheert
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Luister naar auth state veranderingen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    // Cleanup listener bij unmount
    return unsubscribe
  }, [])

  // Login met Google popup
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Uitloggen
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook om auth context te gebruiken
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth moet binnen een AuthProvider gebruikt worden')
  }
  return context
}
