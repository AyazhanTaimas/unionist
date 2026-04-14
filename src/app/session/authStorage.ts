const AUTH_TOKEN_KEY = 'token'
const AUTH_ROLE_KEY = 'role'

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined'
}

function getSessionStorage(): Storage | null {
  if (!canUseBrowserStorage()) {
    return null
  }

  return window.sessionStorage
}

function getLegacyStorage(): Storage | null {
  if (!canUseBrowserStorage()) {
    return null
  }

  return window.localStorage
}

export function getScopedSessionItem(key: string): string | null {
  const sessionValue = getSessionStorage()?.getItem(key)

  if (sessionValue !== null && sessionValue !== undefined) {
    return sessionValue
  }

  const legacyValue = getLegacyStorage()?.getItem(key) ?? null

  if (legacyValue !== null) {
    getSessionStorage()?.setItem(key, legacyValue)
  }

  return legacyValue
}

export function setScopedSessionItem(key: string, value: string): void {
  getSessionStorage()?.setItem(key, value)
  getLegacyStorage()?.removeItem(key)
}

export function removeScopedSessionItem(key: string): void {
  getSessionStorage()?.removeItem(key)
  getLegacyStorage()?.removeItem(key)
}

export function getAuthToken(): string | null {
  return getScopedSessionItem(AUTH_TOKEN_KEY)
}

export function getAuthRole(): string | null {
  return getScopedSessionItem(AUTH_ROLE_KEY)
}

export function setAuthSession(token: string, role: string): void {
  setScopedSessionItem(AUTH_TOKEN_KEY, token)
  setScopedSessionItem(AUTH_ROLE_KEY, role)
}

export function setAuthRole(role: string): void {
  setScopedSessionItem(AUTH_ROLE_KEY, role)
}

export function clearAuthSession(): void {
  removeScopedSessionItem(AUTH_TOKEN_KEY)
  removeScopedSessionItem(AUTH_ROLE_KEY)
}
