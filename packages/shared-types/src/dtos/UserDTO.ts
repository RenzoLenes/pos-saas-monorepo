/**
 * User Data Transfer Objects
 * DTOs for User module - used for communication between layers
 */

export interface UserDTO {
  id: string
  clerkId: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  tenantId?: string | null
  outletId?: string | null
  invitationStatus?: string | null
  invitedAt?: Date | null
  invitedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserSummaryDTO {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
}

export interface UserWithRelationsDTO extends UserDTO {
  tenant?: {
    id: string
    name: string
  } | null
  outlet?: {
    id: string
    name: string
  } | null
}
