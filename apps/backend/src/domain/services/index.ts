/**
 * Domain Services
 * Exporta todos los servicios de dominio
 */

export { StockValidationService } from './StockValidationService'
export type { StockValidationResult } from './StockValidationService'

export { PriceCalculationService } from './PriceCalculationService'
export type {
  VolumeDiscountTier,
  TaxConfig,
  PriceCalculationResult,
} from './PriceCalculationService'

export { SaleNumberGenerationService } from './SaleNumberGenerationService'
