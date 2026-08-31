// 管理员角色与用户结构定义（客户端、服务端共享）。

export const ROLE_SUPER_ADMIN = "super_admin" as const
export const ROLE_ADMIN = "admin" as const

export type AdminRole = typeof ROLE_SUPER_ADMIN | typeof ROLE_ADMIN

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  isActive: boolean
  createdAt: string
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  [ROLE_SUPER_ADMIN]: "系统管理员",
  [ROLE_ADMIN]: "普通管理员",
}
