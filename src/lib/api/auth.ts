// lib/api/auth.ts
import { toast } from "sonner"

export interface User {
  id: string
  username: string
  fullname: string
  email: string
  isVerified?: boolean
}

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  username: string
  fullname: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber?: string
  country: string
  referralID?: string
}

export async function login(params: LoginParams): Promise<User | null> {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Login failed:", error)
    toast.error("Login Failed", {
      description: error instanceof Error ? error.message : "Invalid credentials",
    })
    return null
  }
}

export async function register(params: RegisterParams): Promise<User | null> {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Registration failed")
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Registration failed:", error)
    toast.error( error instanceof Error ? error.message : "Could not create account", {
    })
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/current-user")

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export async function logout(): Promise<boolean> {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
    })

    return response.ok
  } catch (error) {
    console.error("Logout failed:", error)
    return false
  }
}
