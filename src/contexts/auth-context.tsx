import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

interface User {
  username: string
  userId: number
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }

    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8000/accounts/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()

      // Save token and user data
      localStorage.setItem("token", data.token)

      // Create a user object with username
      const userData = {
        username,
        userId: data.user_id || 0,
      }

      localStorage.setItem("user", JSON.stringify(userData))

      setUser(userData)
      setIsAuthenticated(true)

      toast({
        title: "Login Successful",
        description: "Welcome back to SmartSearch!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
      })
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8000/accounts/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const data = await response.json()

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      })

      return data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
      })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setUser(null)

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
