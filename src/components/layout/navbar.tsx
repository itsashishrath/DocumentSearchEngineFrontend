"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ModeToggle } from "@/components/mode-toggle"
import { Search, Upload, LogOut, Menu, X, Home } from "lucide-react"

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Search className="h-6 w-6 text-purple-500" />
            <span className="text-xl font-bold gradient-text">SmartSearch</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/upload") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Upload
              </Link>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Hello, {user?.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4">
          <div className="flex flex-col space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Link>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hello, {user?.username}</span>
                  <ModeToggle />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-2 py-1.5 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-2 py-1.5 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <div className="pt-2">
                  <ModeToggle />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
