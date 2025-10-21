/**
 * Application DTOs
 * Central export point for all Data Transfer Objects
 */

// Sale DTOs
export type {
  SaleDTO,
  SaleItemDTO,
  SaleSummaryDTO,
  DailySummaryDTO,
  PeriodSummaryDTO,
} from './SaleDTO'

// Cart DTOs
export type {
  CartDTO,
  CartItemDTO,
  CartSummaryDTO,
} from './CartDTO'

// Product DTOs
export type {
  ProductDTO,
  ProductSummaryDTO,
  ProductWithInventoryDTO,
} from './ProductDTO'

// Inventory DTOs
export type {
  InventoryDTO,
  InventorySummaryDTO,
  LowStockItemDTO,
  InventoryMovementDTO,
} from './InventoryDTO'

// Customer DTOs
export type {
  CustomerDTO,
  CustomerSummaryDTO,
  CustomerWithStatsDTO,
  CustomerStatsDTO,
} from './CustomerDTO'

// Outlet DTOs
export type {
  OutletDTO,
  OutletSummaryDTO,
} from './OutletDTO'

// User DTOs
export type {
  UserDTO,
  UserSummaryDTO,
  UserWithRelationsDTO,
} from './UserDTO'

// Tenant DTOs
export type {
  TenantDTO,
  TenantSummaryDTO,
  TenantWithStatsDTO,
} from './TenantDTO'

// Category DTOs
export type {
  CategoryDTO,
  CategorySummaryDTO,
  CategoryWithProductsDTO,
} from './CategoryDTO'
