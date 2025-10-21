import type { PrismaClient } from '@prisma/client'
import type {
  ICartRepository,
  IProductRepository,
  ICustomerRepository,
  ISaleRepository,
  IInventoryRepository,
  ICategoryRepository,
  ITenantRepository,
  IOutletRepository,
  IUserRepository,
} from '@/domain/repositories'
import {
  PrismaCartRepository,
  PrismaProductRepository,
  PrismaCustomerRepository,
  PrismaSaleRepository,
  PrismaInventoryRepository,
  PrismaCategoryRepository,
  PrismaTenantRepository,
  PrismaOutletRepository,
  PrismaUserRepository,
} from '@/infrastructure/repositories'

/**
 * Repository Factory
 * Centraliza la creación de repositorios con inyección de dependencias
 */
export class RepositoryFactory {
  private static cartRepository: ICartRepository | null = null
  private static productRepository: IProductRepository | null = null
  private static customerRepository: ICustomerRepository | null = null
  private static saleRepository: ISaleRepository | null = null
  private static inventoryRepository: IInventoryRepository | null = null
  private static categoryRepository: ICategoryRepository | null = null
  private static tenantRepository: ITenantRepository | null = null
  private static outletRepository: IOutletRepository | null = null
  private static userRepository: IUserRepository | null = null
  private static prismaClient: PrismaClient | null = null

  private constructor() {
    // Private constructor to prevent instantiation
  }

  /**
   * Inicializa la factory con el cliente de Prisma
   */
  static initialize(prisma: PrismaClient): void {
    this.prismaClient = prisma
    this.cartRepository = new PrismaCartRepository(prisma)
    this.productRepository = new PrismaProductRepository(prisma)
    this.customerRepository = new PrismaCustomerRepository(prisma)
    this.saleRepository = new PrismaSaleRepository(prisma)
    this.inventoryRepository = new PrismaInventoryRepository(prisma)
    this.categoryRepository = new PrismaCategoryRepository(prisma)
    this.tenantRepository = new PrismaTenantRepository(prisma)
    this.outletRepository = new PrismaOutletRepository(prisma)
    this.userRepository = new PrismaUserRepository(prisma)
  }

  /**
   * Resetea todas las instancias (útil para testing)
   */
  static reset(): void {
    this.cartRepository = null
    this.productRepository = null
    this.customerRepository = null
    this.saleRepository = null
    this.inventoryRepository = null
    this.categoryRepository = null
    this.tenantRepository = null
    this.outletRepository = null
    this.userRepository = null
    this.prismaClient = null
  }

  /**
   * Obtiene instancia del PrismaClient
   */
  static getPrismaClient(): PrismaClient {
    if (!this.prismaClient) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.prismaClient
  }

  /**
   * Obtiene instancia del CartRepository
   */
  static getCartRepository(): ICartRepository {
    if (!this.cartRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.cartRepository
  }

  /**
   * Obtiene instancia del ProductRepository
   */
  static getProductRepository(): IProductRepository {
    if (!this.productRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.productRepository
  }

  /**
   * Obtiene instancia del CustomerRepository
   */
  static getCustomerRepository(): ICustomerRepository {
    if (!this.customerRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.customerRepository
  }

  /**
   * Obtiene instancia del SaleRepository
   */
  static getSaleRepository(): ISaleRepository {
    if (!this.saleRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.saleRepository
  }

  /**
   * Obtiene instancia del InventoryRepository
   */
  static getInventoryRepository(): IInventoryRepository {
    if (!this.inventoryRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.inventoryRepository
  }

  /**
   * Obtiene instancia del CategoryRepository
   */
  static getCategoryRepository(): ICategoryRepository {
    if (!this.categoryRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.categoryRepository
  }

  /**
   * Obtiene instancia del TenantRepository
   */
  static getTenantRepository(): ITenantRepository {
    if (!this.tenantRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.tenantRepository
  }

  /**
   * Obtiene instancia del OutletRepository
   */
  static getOutletRepository(): IOutletRepository {
    if (!this.outletRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.outletRepository
  }

  /**
   * Obtiene instancia del UserRepository
   */
  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      throw new Error('RepositoryFactory no ha sido inicializada. Llama a initialize() primero.')
    }
    return this.userRepository
  }

  /**
   * Verifica si la factory ha sido inicializada
   */
  static isInitialized(): boolean {
    return (
      this.cartRepository !== null &&
      this.productRepository !== null &&
      this.customerRepository !== null &&
      this.saleRepository !== null &&
      this.inventoryRepository !== null &&
      this.categoryRepository !== null &&
      this.tenantRepository !== null &&
      this.outletRepository !== null &&
      this.userRepository !== null
    )
  }
}
