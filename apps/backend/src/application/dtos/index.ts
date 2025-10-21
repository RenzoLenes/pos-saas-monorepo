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
