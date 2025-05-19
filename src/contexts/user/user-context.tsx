"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCurrentUser, login, logout as apiLogout, type User } from "@/lib/api/auth"

interface UserContextType {
  user: User | null
  loading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<User | null>
  logout: () => Promise<boolean>
  updateUser: (userData: Partial<User>) => Promise<boolean>
}

const UserContext = createContext<UserContextType | null>(null)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        // Load profile image from localStorage if available
        if (userData && localStorage.getItem("profileImage")) {
          // We don't need to do anything here as the Avatar component will handle this
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch user"))
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const loginUser = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const userData = await login({ email, password })
      setUser(userData)
      return userData
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"))
      return null
    } finally {
      setLoading(false)
    }
  }

  const logoutUser = async () => {
    setLoading(true)
    try {
      const success = await apiLogout()
      if (success) {
        setUser(null)
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Logout failed"))
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return false

    setLoading(true)
    try {
      // In a real app, you would call an API endpoint here
      // For now, we'll just update the local state
      setUser({ ...user, ...userData })

      // Store in localStorage for persistence
      localStorage.setItem("userData", JSON.stringify({ ...user, ...userData }))

      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Update failed"))
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login: loginUser,
        logout: logoutUser,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
