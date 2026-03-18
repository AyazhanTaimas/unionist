import { api } from '@/api/instance'

interface CurrentUser {
  id: number
  role?: string | null
}

export interface DormAccessState {
  isStudent: boolean
  isApproved: boolean
}

const USER_STORAGE_KEY = 'user'
const USER_ID_STORAGE_KEY = 'user_id'
const DORM_APPROVAL_STORAGE_KEY = 'dorm_student_is_approved'

export const UNAPPROVED_STUDENT_ALLOWED_ROUTES = [
  '/news',
  '/housing',
  '/myrequest',
] as const

const ALWAYS_ALLOWED_ROUTES = new Set([
  ...UNAPPROVED_STUDENT_ALLOWED_ROUTES,
  '/login',
  '/profile',
  '/payment-success',
  '/payment-cancel',
  '/gym/payment-success',
])

let currentUserValue: CurrentUser | null = null
let currentUserPromise: Promise<CurrentUser | null> | null = null
let dormAccessStateValue: DormAccessState | null = null
let dormAccessStatePromise: Promise<DormAccessState> | null = null

function hasToken(): boolean {
  return Boolean(localStorage.getItem('token'))
}

function normalizePath(path: string): string {
  const normalized = path.replace(/\/+$/, '')
  return normalized === '' ? '/' : normalized
}

function readStoredUser(): CurrentUser | null {
  if (!hasToken()) {
    return null
  }

  const raw = localStorage.getItem(USER_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as CurrentUser

    if (typeof parsed?.id === 'number') {
      return parsed
    }
  } catch {
    //
  }

  return null
}

function persistUser(user: CurrentUser | null): void {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(USER_ID_STORAGE_KEY)
    return
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  localStorage.setItem(USER_ID_STORAGE_KEY, String(user.id))
}

export function persistDormAccessUser(user: CurrentUser | null): void {
  currentUserValue = user
  currentUserPromise = null
  persistUser(user)
}

function readStoredApproval(): boolean | null {
  if (!hasToken()) {
    return null
  }

  const raw = localStorage.getItem(DORM_APPROVAL_STORAGE_KEY)

  if (raw === '1') {
    return true
  }

  if (raw === '0') {
    return false
  }

  return null
}

function persistApproval(isApproved: boolean): void {
  localStorage.setItem(DORM_APPROVAL_STORAGE_KEY, isApproved ? '1' : '0')
}

async function loadCurrentUser(): Promise<CurrentUser | null> {
  if (!hasToken()) {
    currentUserValue = null
    return null
  }

  if (currentUserValue) {
    return currentUserValue
  }

  const storedUser = readStoredUser()

  if (storedUser) {
    currentUserValue = storedUser
    return storedUser
  }

  if (!currentUserPromise) {
    currentUserPromise = api
      .get('/me')
      .then(({ data }) => {
        const user = data?.data as CurrentUser | null

        currentUserValue = user
        persistUser(user)

        return user
      })
      .catch(() => {
        currentUserValue = null
        persistUser(null)

        return null
      })
      .finally(() => {
        currentUserPromise = null
      })
  }

  return currentUserPromise
}

export function canUnapprovedStudentAccessPath(path: string): boolean {
  return ALWAYS_ALLOWED_ROUTES.has(normalizePath(path))
}

export function getCachedDormAccessState(): DormAccessState | null {
  if (!hasToken()) {
    return null
  }

  if (dormAccessStateValue) {
    return dormAccessStateValue
  }

  const user = currentUserValue ?? readStoredUser()
  const storedApproval = readStoredApproval()

  if (!user || user.role !== 'student' || storedApproval === null) {
    return null
  }

  return {
    isStudent: true,
    isApproved: storedApproval,
  }
}

export async function getDormAccessState(): Promise<DormAccessState> {
  if (!hasToken()) {
    return {
      isStudent: false,
      isApproved: true,
    }
  }

  if (dormAccessStateValue) {
    return dormAccessStateValue
  }

  const cachedState = getCachedDormAccessState()

  if (cachedState) {
    dormAccessStateValue = cachedState
    return cachedState
  }

  if (!dormAccessStatePromise) {
    dormAccessStatePromise = (async () => {
      const user = await loadCurrentUser()

      if (!user || user.role !== 'student') {
        return {
          isStudent: false,
          isApproved: true,
        }
      }

      try {
        let isApproved: boolean | null = null

        try {
          const { data } = await api.get(`/settlements/is-living/${user.id}`)
          isApproved = Boolean(data?.data?.is_living)
        } catch {
          const { data } = await api.get(`/showStatus/${user.id}`)
          isApproved = Boolean(data?.data?.is_living)
        }

        persistApproval(Boolean(isApproved))

        return {
          isStudent: true,
          isApproved: Boolean(isApproved),
        }
      } catch {
        return {
          isStudent: true,
          isApproved: readStoredApproval() ?? false,
        }
      }
    })()
      .then((state) => {
        dormAccessStateValue = state
        return state
      })
      .finally(() => {
        dormAccessStatePromise = null
      })
  }

  return dormAccessStatePromise
}

export function resetDormAccessState(): void {
  currentUserValue = null
  currentUserPromise = null
  dormAccessStateValue = null
  dormAccessStatePromise = null

  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem(USER_ID_STORAGE_KEY)
  localStorage.removeItem(DORM_APPROVAL_STORAGE_KEY)
}
