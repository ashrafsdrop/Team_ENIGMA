import { useSyncExternalStore } from "react"
import { API_BASE_URL, ROLES, STORAGE_KEYS } from "./constants"

export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

/* ------------------------------- auth store -------------------------------- */

const subscribe = (callback) => {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

const readItem = (key) => () =>
  typeof window === "undefined" ? null : localStorage.getItem(key)

export function useAuth() {
  const accessToken = useSyncExternalStore(
    subscribe,
    readItem(STORAGE_KEYS.ACCESS_TOKEN),
    () => null,
  )
  const role = useSyncExternalStore(
    subscribe,
    readItem(STORAGE_KEYS.USER_ROLE),
    () => null,
  )
  const userName = useSyncExternalStore(
    subscribe,
    readItem(STORAGE_KEYS.USER_NAME),
    () => null,
  )
  return { accessToken, role, userName, authenticated: Boolean(accessToken) }
}

/* ------------------------------ storage / auth ----------------------------- */

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return
  if (access) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access)
  if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh)
}

export function clearAuth() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_ROLE)
  localStorage.removeItem(STORAGE_KEYS.USER_NAME)
}

export function getStoredRole() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEYS.USER_ROLE)
}

export function setStoredRole(role) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role)
}

export function getStoredUserName() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEYS.USER_NAME)
}

export function setStoredUser({ role, name }) {
  if (typeof window === "undefined") return
  if (role) setStoredRole(role)
  if (name) localStorage.setItem(STORAGE_KEYS.USER_NAME, name)
}

export function roleLabel(role) {
  return (ROLES[role] && ROLES[role].label) || role || "Guest"
}

export function dashboardRouteForRole(role) {
  return (ROLES[role] && ROLES[role].route) || "/login"
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}

export function logout() {
  clearAuth()
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

/* --------------------------------- api utils ------------------------------- */

export async function apiRequest(path, options = {}) {
  const { auth = true, method = "GET", body, headers = {}, ...rest } = options

  const requestHeaders = { ...headers }
  if (auth) {
    const token = getAccessToken()
    if (token) requestHeaders.Authorization = `Bearer ${token}`
  }
  if (body && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json"
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body:
      body instanceof FormData
        ? body
        : body
          ? JSON.stringify(body)
          : undefined,
    ...rest,
  })

  if (!res.ok) {
    const error = new Error(`Request failed (${res.status})`)
    error.status = res.status
    try {
      error.data = await res.json()
    } catch {
      error.data = null
    }
    throw error
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

/* ------------------------------- formatting ------------------------------- */

export function formatDate(value, options = {}) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  })
}

export function formatTime(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

export function formatDateTime(value) {
  if (!value) return "—"
  return `${formatDate(value)} · ${formatTime(value)}`
}

export function formatNumber(value, { maximumFractionDigits = 1 } = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return Number(value).toLocaleString("en-US", { maximumFractionDigits })
}

export function formatWeight(kg, { unit = "kg" } = {}) {
  if (kg === null || kg === undefined || Number.isNaN(kg)) return "—"
  const value = Number(kg)
  if (unit === "tonne" || value >= 1000) {
    return `${formatNumber(value / 1000, { maximumFractionDigits: 2 })} t`
  }
  return `${formatNumber(value, { maximumFractionDigits: 0 })} kg`
}

export function capitalize(value) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")
}

export function timeAgo(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

export function getStatus(status) {
  return status || "pending"
}
