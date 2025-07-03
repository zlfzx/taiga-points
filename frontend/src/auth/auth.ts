import { useNavigate } from "react-router"

export function getToken() {
  return localStorage.getItem("access_token")
}

export function isAuthenticated() {
  return !!getToken()
}

export function useLogout() {
  const navigate = useNavigate()

  return () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    navigate("/auth")
  }
}