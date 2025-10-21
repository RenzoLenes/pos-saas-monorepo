import { RepositoryFactory } from './RepositoryFactory'
import {
  // Cart Use Cases
  AddItemToCartUseCase,
  ApplyDiscountUseCase,
  ClearCartUseCase,
  CreateCartUseCase,
  GetCartByIdUseCase,
  RemoveCartItemUseCase,
  UpdateCartItemUseCase,
  GetMyCartsUseCase,
  AssignCustomerToCartUseCase,
  HoldCartUseCase,
  ActivateCartUseCase,
  DeleteCartUseCase,
  // Product Use Cases
  CreateProductUseCase,
  DeleteProductUseCase,
  GetProductByBarcodeUseCase,
  GetProductByIdUseCase,
  GetAllProductsUseCase,
  GetProductsByCategoryUseCase,
  SearchProductsUseCase,
  UpdateProductUseCase,
  // Customer Use Cases
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  GetCustomerByIdUseCase,
  GetCustomerStatsUseCase,
  SearchCustomersUseCase,
  UpdateCustomerUseCase,
  // Sale Use Cases
  CompleteSaleUseCase,
  GetDailySummaryUseCase,
  GetPeriodSummaryUseCase,
  GetSaleByIdUseCase,
  GetSalesUseCase,
  // Inventory Use Cases
  GetInventoryByOutletUseCase,
  GetInventoryByIdUseCase,
  GetInventoryByProductIdUseCase,
  // GetInventoryMovementsUseCase, // TODO: Implement when InventoryMovement table is created
  GetLowStockItemsUseCase,
  TransferInventoryUseCase,
  UpdateStockUseCase,
  GetInventoryByOutletWithRelationsUseCase,
  GetInventoryByIdWithRelationsUseCase,
  GetLowStockWithRelationsUseCase,
  // Category Use Cases
  GetAllCategoriesUseCase,
  GetCategoryByIdUseCase,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  // Outlet Use Cases
  GetAllOutletsUseCase,
  GetOutletByIdUseCase,
  CreateOutletUseCase,
  UpdateOutletUseCase,
  DeleteOutletUseCase,
  // Tenant Use Cases
  GetAllTenantsWithCountsUseCase,
  UpdateTenantStatusUseCase,
  GetGlobalAnalyticsUseCase,
  GetCurrentTenantUseCase,
  UpdateCurrentTenantUseCase,
  // Auth Use Cases
  CreateTenantWithAdminUseCase,
  SyncUserFromClerkUseCase,
  ProcessSuperadminLoginUseCase,
  ProcessFirstSignupUseCase,
  ProcessInvitedUserUseCase,
  InviteUserUseCase,
  // User Use Cases
  GetAllUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  GetCurrentUserUseCase,
  GetCustomerByTenantUseCase,
} from '@/application/use-cases'

/**
 * Use Case Factory
 * Centraliza la creación de Use Cases con resolución automática de dependencias
 */
export class UseCaseFactory {
  // Cache de instancias
  private static instances: Map<string, any> = new Map()

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Resetea el cache de instancias (útil para testing)
   */
  static reset(): void {
    this.instances.clear()
  }

  /**
   * Obtiene una instancia del Use Case, creándola si no existe (lazy loading)
   */
  private static getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory())
    }
    return this.instances.get(key)!
  }

  // ==================== CART USE CASES ====================

  static getAddItemToCartUseCase(): AddItemToCartUseCase {
    return this.getInstance('AddItemToCartUseCase', () => {
      return new AddItemToCartUseCase(
        RepositoryFactory.getCartRepository(),
        RepositoryFactory.getProductRepository()
      )
    })
  }

  static getApplyDiscountUseCase(): ApplyDiscountUseCase {
    return this.getInstance('ApplyDiscountUseCase', () => {
      return new ApplyDiscountUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getClearCartUseCase(): ClearCartUseCase {
    return this.getInstance('ClearCartUseCase', () => {
      return new ClearCartUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getGetOrCreateCartUseCase(): CreateCartUseCase {
    return this.getInstance('GetOrCreateCartUseCase', () => {
      return new CreateCartUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getRemoveCartItemUseCase(): RemoveCartItemUseCase {
    return this.getInstance('RemoveCartItemUseCase', () => {
      return new RemoveCartItemUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getUpdateCartItemUseCase(): UpdateCartItemUseCase {
    return this.getInstance('UpdateCartItemUseCase', () => {
      return new UpdateCartItemUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getGetMyCartsUseCase(): GetMyCartsUseCase {
    return this.getInstance('GetMyCartsUseCase', () => {
      return new GetMyCartsUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getAssignCustomerToCartUseCase(): AssignCustomerToCartUseCase {
    return this.getInstance('AssignCustomerToCartUseCase', () => {
      return new AssignCustomerToCartUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getHoldCartUseCase(): HoldCartUseCase {
    return this.getInstance('HoldCartUseCase', () => {
      return new HoldCartUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getActivateCartUseCase(): ActivateCartUseCase {
    return this.getInstance('ActivateCartUseCase', () => {
      return new ActivateCartUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getDeleteCartUseCase(): DeleteCartUseCase {
    return this.getInstance('DeleteCartUseCase', () => {
      return new DeleteCartUseCase(RepositoryFactory.getCartRepository())
    })
  }

  static getGetCartByIdUseCase(): GetCartByIdUseCase {
    return this.getInstance('GetCartByIdUseCase', () => {
      return new GetCartByIdUseCase(RepositoryFactory.getCartRepository())
    })
  }

  // ==================== PRODUCT USE CASES ====================

  static getCreateProductUseCase(): CreateProductUseCase {
    return this.getInstance('CreateProductUseCase', () => {
      return new CreateProductUseCase(
        RepositoryFactory.getProductRepository(),
        RepositoryFactory.getInventoryRepository()
      )
    })
  }

  static getDeleteProductUseCase(): DeleteProductUseCase {
    return this.getInstance('DeleteProductUseCase', () => {
      return new DeleteProductUseCase(RepositoryFactory.getProductRepository())
    })
  }

  static getGetProductByBarcodeUseCase(): GetProductByBarcodeUseCase {
    return this.getInstance('GetProductByBarcodeUseCase', () => {
      return new GetProductByBarcodeUseCase(RepositoryFactory.getProductRepository())
    })
  }

  static getGetProductByIdUseCase(): GetProductByIdUseCase {
    return this.getInstance('GetProductByIdUseCase', () => {
      return new GetProductByIdUseCase(RepositoryFactory.getProductRepository())
    })
  }

  static getGetAllProductsUseCase(): GetAllProductsUseCase {
    return this.getInstance('GetAllProductsUseCase', () => {
      return new GetAllProductsUseCase(RepositoryFactory.getProductRepository())
    })
  }

  static getGetProductsByCategoryUseCase(): GetProductsByCategoryUseCase {
    return this.getInstance('GetProductsByCategoryUseCase', () => {
      return new GetProductsByCategoryUseCase(RepositoryFactory.getProductRepository())
    })
  }

  static getSearchProductsUseCase(): SearchProductsUseCase {
    return this.getInstance('SearchProductsUseCase', () => {
      return new SearchProductsUseCase(RepositoryFactory.getProductRepository())
    })
  }

  static getUpdateProductUseCase(): UpdateProductUseCase {
    return this.getInstance('UpdateProductUseCase', () => {
      return new UpdateProductUseCase(RepositoryFactory.getProductRepository())
    })
  }

  // ==================== CUSTOMER USE CASES ====================

  static getCreateCustomerUseCase(): CreateCustomerUseCase {
    return this.getInstance('CreateCustomerUseCase', () => {
      return new CreateCustomerUseCase(RepositoryFactory.getCustomerRepository())
    })
  }

  static getDeleteCustomerUseCase(): DeleteCustomerUseCase {
    return this.getInstance('DeleteCustomerUseCase', () => {
      return new DeleteCustomerUseCase(RepositoryFactory.getCustomerRepository())
    })
  }

  static getGetCustomerByIdUseCase(): GetCustomerByIdUseCase {
    return this.getInstance('GetCustomerByIdUseCase', () => {
      return new GetCustomerByIdUseCase(RepositoryFactory.getCustomerRepository())
    })
  }

  static getGetCustomerStatsUseCase(): GetCustomerStatsUseCase {
    return this.getInstance('GetCustomerStatsUseCase', () => {
      return new GetCustomerStatsUseCase(RepositoryFactory.getCustomerRepository())
    })
  }

  static getSearchCustomersUseCase(): SearchCustomersUseCase {
    return this.getInstance('SearchCustomersUseCase', () => {
      return new SearchCustomersUseCase(RepositoryFactory.getCustomerRepository())
    })
  }

  static getUpdateCustomerUseCase(): UpdateCustomerUseCase {
    return this.getInstance('UpdateCustomerUseCase', () => {
      return new UpdateCustomerUseCase(RepositoryFactory.getCustomerRepository())
    })
  }

  static getGetCustomerByTenantUseCase(): GetCustomerByTenantUseCase {
    return this.getInstance('GetCustomerByTenantUseCase', () => {
      return new GetCustomerByTenantUseCase(RepositoryFactory.getCustomerRepository())
    })
  }

  // ==================== SALE USE CASES ====================

  static getCompleteSaleUseCase(): CompleteSaleUseCase {
    return this.getInstance('CompleteSaleUseCase', () => {
      return new CompleteSaleUseCase(
        RepositoryFactory.getSaleRepository(),
        RepositoryFactory.getCartRepository(),
        RepositoryFactory.getInventoryRepository()
      )
    })
  }

  static getGetDailySummaryUseCase(): GetDailySummaryUseCase {
    return this.getInstance('GetDailySummaryUseCase', () => {
      return new GetDailySummaryUseCase(RepositoryFactory.getSaleRepository())
    })
  }

  static getGetPeriodSummaryUseCase(): GetPeriodSummaryUseCase {
    return this.getInstance('GetPeriodSummaryUseCase', () => {
      return new GetPeriodSummaryUseCase(RepositoryFactory.getSaleRepository())
    })
  }

  static getGetSaleByIdUseCase(): GetSaleByIdUseCase {
    return this.getInstance('GetSaleByIdUseCase', () => {
      return new GetSaleByIdUseCase(RepositoryFactory.getSaleRepository())
    })
  }

  static getGetSalesUseCase(): GetSalesUseCase {
    return this.getInstance('GetSalesUseCase', () => {
      return new GetSalesUseCase(RepositoryFactory.getSaleRepository())
    })
  }

  // ==================== INVENTORY USE CASES ====================

  static getGetInventoryByOutletUseCase(): GetInventoryByOutletUseCase {
    return this.getInstance('GetInventoryByOutletUseCase', () => {
      return new GetInventoryByOutletUseCase(RepositoryFactory.getInventoryRepository())
    })
  }

  static getGetInventoryByIdUseCase(): GetInventoryByIdUseCase {
    return this.getInstance('GetInventoryByIdUseCase', () => {
      return new GetInventoryByIdUseCase(RepositoryFactory.getInventoryRepository())
    })
  }

  static getGetInventoryByProductIdUseCase(): GetInventoryByProductIdUseCase {
    return this.getInstance('GetInventoryByProductIdUseCase', () => {
      return new GetInventoryByProductIdUseCase(RepositoryFactory.getInventoryRepository())
    })
  }

  // TODO: Implement when InventoryMovement table is created
  // static getGetInventoryMovementsUseCase(): GetInventoryMovementsUseCase {
  //   return this.getInstance('GetInventoryMovementsUseCase', () => {
  //     return new GetInventoryMovementsUseCase(RepositoryFactory.getInventoryRepository())
  //   })
  // }

  static getGetLowStockItemsUseCase(): GetLowStockItemsUseCase {
    return this.getInstance('GetLowStockItemsUseCase', () => {
      return new GetLowStockItemsUseCase(RepositoryFactory.getInventoryRepository())
    })
  }

  static getTransferInventoryUseCase(): TransferInventoryUseCase {
    return this.getInstance('TransferInventoryUseCase', () => {
      return new TransferInventoryUseCase(
        RepositoryFactory.getInventoryRepository(),
        RepositoryFactory.getProductRepository()
      )
    })
  }

  static getUpdateStockUseCase(): UpdateStockUseCase {
    return this.getInstance('UpdateStockUseCase', () => {
      return new UpdateStockUseCase(
        RepositoryFactory.getInventoryRepository(),
        RepositoryFactory.getProductRepository()
      )
    })
  }

  static getGetInventoryByOutletWithRelationsUseCase(): GetInventoryByOutletWithRelationsUseCase {
    return this.getInstance('GetInventoryByOutletWithRelationsUseCase', () => {
      return new GetInventoryByOutletWithRelationsUseCase(RepositoryFactory.getInventoryRepository())
    })
  }

  static getGetInventoryByIdWithRelationsUseCase(): GetInventoryByIdWithRelationsUseCase {
    return this.getInstance('GetInventoryByIdWithRelationsUseCase', () => {
      return new GetInventoryByIdWithRelationsUseCase(RepositoryFactory.getInventoryRepository())
    })
  }

  static getGetLowStockWithRelationsUseCase(): GetLowStockWithRelationsUseCase {
    return this.getInstance('GetLowStockWithRelationsUseCase', () => {
      return new GetLowStockWithRelationsUseCase(RepositoryFactory.getInventoryRepository())
    })
  }

  // ==================== CATEGORY USE CASES ====================

  static getGetAllCategoriesUseCase(): GetAllCategoriesUseCase {
    return this.getInstance('GetAllCategoriesUseCase', () => {
      return new GetAllCategoriesUseCase(RepositoryFactory.getCategoryRepository())
    })
  }

  static getGetCategoryByIdUseCase(): GetCategoryByIdUseCase {
    return this.getInstance('GetCategoryByIdUseCase', () => {
      return new GetCategoryByIdUseCase(RepositoryFactory.getCategoryRepository())
    })
  }

  static getCreateCategoryUseCase(): CreateCategoryUseCase {
    return this.getInstance('CreateCategoryUseCase', () => {
      return new CreateCategoryUseCase(RepositoryFactory.getCategoryRepository())
    })
  }

  static getUpdateCategoryUseCase(): UpdateCategoryUseCase {
    return this.getInstance('UpdateCategoryUseCase', () => {
      return new UpdateCategoryUseCase(RepositoryFactory.getCategoryRepository())
    })
  }

  static getDeleteCategoryUseCase(): DeleteCategoryUseCase {
    return this.getInstance('DeleteCategoryUseCase', () => {
      return new DeleteCategoryUseCase(RepositoryFactory.getCategoryRepository())
    })
  }

  // ==================== OUTLET USE CASES ====================

  static getGetAllOutletsUseCase(): GetAllOutletsUseCase {
    return this.getInstance('GetAllOutletsUseCase', () => {
      return new GetAllOutletsUseCase(RepositoryFactory.getOutletRepository())
    })
  }

  static getGetOutletByIdUseCase(): GetOutletByIdUseCase {
    return this.getInstance('GetOutletByIdUseCase', () => {
      return new GetOutletByIdUseCase(RepositoryFactory.getOutletRepository())
    })
  }

  static getCreateOutletUseCase(): CreateOutletUseCase {
    return this.getInstance('CreateOutletUseCase', () => {
      return new CreateOutletUseCase(RepositoryFactory.getOutletRepository())
    })
  }

  static getUpdateOutletUseCase(): UpdateOutletUseCase {
    return this.getInstance('UpdateOutletUseCase', () => {
      return new UpdateOutletUseCase(RepositoryFactory.getOutletRepository())
    })
  }

  static getDeleteOutletUseCase(): DeleteOutletUseCase {
    return this.getInstance('DeleteOutletUseCase', () => {
      return new DeleteOutletUseCase(RepositoryFactory.getOutletRepository())
    })
  }

  // ==================== TENANT USE CASES ====================

  static getGetAllTenantsWithCountsUseCase(): GetAllTenantsWithCountsUseCase {
    return this.getInstance('GetAllTenantsWithCountsUseCase', () => {
      return new GetAllTenantsWithCountsUseCase(RepositoryFactory.getTenantRepository())
    })
  }

  static getUpdateTenantStatusUseCase(): UpdateTenantStatusUseCase {
    return this.getInstance('UpdateTenantStatusUseCase', () => {
      return new UpdateTenantStatusUseCase(RepositoryFactory.getTenantRepository())
    })
  }

  static getGetGlobalAnalyticsUseCase(): GetGlobalAnalyticsUseCase {
    return this.getInstance('GetGlobalAnalyticsUseCase', () => {
      return new GetGlobalAnalyticsUseCase(RepositoryFactory.getTenantRepository())
    })
  }

  static getGetCurrentTenantUseCase(): GetCurrentTenantUseCase {
    return this.getInstance('GetCurrentTenantUseCase', () => {
      return new GetCurrentTenantUseCase(RepositoryFactory.getTenantRepository())
    })
  }

  static getUpdateCurrentTenantUseCase(): UpdateCurrentTenantUseCase {
    return this.getInstance('UpdateCurrentTenantUseCase', () => {
      return new UpdateCurrentTenantUseCase(RepositoryFactory.getTenantRepository())
    })
  }

  // ==================== AUTH USE CASES ====================

  static getCreateTenantWithAdminUseCase(): CreateTenantWithAdminUseCase {
    return this.getInstance('CreateTenantWithAdminUseCase', () => {
      return new CreateTenantWithAdminUseCase()
    })
  }

  static getSyncUserFromClerkUseCase(): SyncUserFromClerkUseCase {
    return this.getInstance('SyncUserFromClerkUseCase', () => {
      return new SyncUserFromClerkUseCase(RepositoryFactory.getUserRepository())
    })
  }

  static getProcessSuperadminLoginUseCase(): ProcessSuperadminLoginUseCase {
    return this.getInstance('ProcessSuperadminLoginUseCase', () => {
      return new ProcessSuperadminLoginUseCase()
    })
  }

  static getProcessFirstSignupUseCase(): ProcessFirstSignupUseCase {
    return this.getInstance('ProcessFirstSignupUseCase', () => {
      return new ProcessFirstSignupUseCase()
    })
  }

  static getProcessInvitedUserUseCase(): ProcessInvitedUserUseCase {
    return this.getInstance('ProcessInvitedUserUseCase', () => {
      return new ProcessInvitedUserUseCase()
    })
  }

  static getInviteUserUseCase(): InviteUserUseCase {
    return this.getInstance('InviteUserUseCase', () => {
      return new InviteUserUseCase()
    })
  }

  // ==================== USER USE CASES ====================

  static getGetCurrentUserUseCase(): GetCurrentUserUseCase {
    return this.getInstance('GetCurrentUserUseCase', () => {
      return new GetCurrentUserUseCase(RepositoryFactory.getUserRepository())
    })
  }

  static getGetAllUsersUseCase(): GetAllUsersUseCase {
    return this.getInstance('GetAllUsersUseCase', () => {
      return new GetAllUsersUseCase(RepositoryFactory.getUserRepository())
    })
  }

  static getGetUserByIdUseCase(): GetUserByIdUseCase {
    return this.getInstance('GetUserByIdUseCase', () => {
      return new GetUserByIdUseCase(RepositoryFactory.getUserRepository())
    })
  }

  static getUpdateUserUseCase(): UpdateUserUseCase {
    return this.getInstance('UpdateUserUseCase', () => {
      return new UpdateUserUseCase(
        RepositoryFactory.getUserRepository(),
        RepositoryFactory.getOutletRepository()
      )
    })
  }
}
