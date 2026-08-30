// 前端模拟认证：管理员用户保存在 localStorage 中。
// 真实项目中应替换为服务端接口与安全会话。

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "超级管理员" | "管理员"
  createdAt: string
}

export interface StoredAdminUser extends AdminUser {
  password: string
}

const USERS_KEY = "danci-admin:users"
const SESSION_KEY = "danci-admin:session"

// 默认种子管理员，保证首次访问即可登录并展示列表。
const SEED_USERS: StoredAdminUser[] = [
  {
    id: "seed-admin",
    name: "系统管理员",
    email: "admin@danci.com",
    password: "admin123",
    role: "超级管理员",
    createdAt: "2026-01-01T08:00:00.000Z",
  },
  {
    id: "seed-ops",
    name: "运营管理员",
    email: "ops@danci.com",
    password: "admin123",
    role: "管理员",
    createdAt: "2026-02-15T08:00:00.000Z",
  },
]

function readStoredUsers(): StoredAdminUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredAdminUser[]
  } catch {
    return []
  }
}

function writeStoredUsers(users: StoredAdminUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSessionUser(): AdminUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  } catch {
    return null
  }
}

function setSessionUser(user: AdminUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSessionUser() {
  window.localStorage.removeItem(SESSION_KEY)
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function listAdminUsers(): AdminUser[] {
  const stored = readStoredUsers()
  const users = stored.length > 0 ? stored : SEED_USERS
  return users.map(({ password: _password, ...user }) => user)
}

export function signInUser(email: string, password: string): AdminUser {
  const stored = readStoredUsers()
  const source = stored.length > 0 ? stored : SEED_USERS
  const found = source.find((u) => u.email.toLowerCase() === normalizeEmail(email))
  if (!found) {
    throw new Error("该邮箱尚未注册")
  }
  if (found.password !== password) {
    throw new Error("密码错误，请重试")
  }
  const { password: _password, ...user } = found
  setSessionUser(user)
  return user
}

export function signUpUser(
  name: string,
  email: string,
  password: string
): AdminUser {
  const stored = readStoredUsers()
  const source = stored.length > 0 ? stored : SEED_USERS
  if (source.some((u) => u.email.toLowerCase() === normalizeEmail(email))) {
    throw new Error("该邮箱已被注册")
  }
  const user: AdminUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.trim(),
    role: "管理员",
    createdAt: new Date().toISOString(),
  }
  writeStoredUsers([...source, { ...user, password }])
  setSessionUser(user)
  return user
}