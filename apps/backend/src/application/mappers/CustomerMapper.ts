/**
 * Customer Mapper
 * Converts between Prisma models and Customer DTOs
 */

import type { Customer, Sale } from '@prisma/client'
import type { CustomerDTO, CustomerSummaryDTO, CustomerWithStatsDTO } from '@/application/dtos'

type CustomerWithSales = Customer & {
  sales?: Sale[]
}

interface CustomerStatsData {
  totalPurchases: number
  totalSpent: number
  lastPurchaseDate: Date | null
  averageTicket: number
}

export class CustomerMapper {
  /**
   * Convert Prisma Customer to CustomerDTO
   */
  static toDTO(customer: Customer): CustomerDTO {
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      isActive: customer.isActive,
      tenantId: customer.tenantId,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }
  }

  /**
   * Convert Prisma Customer to CustomerSummaryDTO (lighter version)
   */
  static toSummaryDTO(customer: Customer): CustomerSummaryDTO {
    return {
      id: customer.id,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      isActive: customer.isActive,
    }
  }

  /**
   * Convert Prisma Customer with stats to CustomerWithStatsDTO
   */
  static toWithStatsDTO(
    customer: Customer,
    stats: CustomerStatsData
  ): CustomerWithStatsDTO {
    const baseDTO = this.toDTO(customer)

    return {
      ...baseDTO,
      stats: {
        totalPurchases: stats.totalPurchases,
        totalSpent: stats.totalSpent,
        lastPurchaseDate: stats.lastPurchaseDate,
        averageTicket: stats.averageTicket,
      },
    }
  }

  /**
   * Calculate stats from sales
   */
  static calculateStats(sales: Sale[]): CustomerStatsData {
    const totalPurchases = sales.length
    const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const lastPurchaseDate = sales.length > 0
      ? sales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
      : null
    const averageTicket = totalPurchases > 0 ? totalSpent / totalPurchases : 0

    return {
      totalPurchases,
      totalSpent,
      lastPurchaseDate,
      averageTicket,
    }
  }

  /**
   * Convert Customer with sales to CustomerWithStatsDTO
   */
  static toWithCalculatedStatsDTO(customer: CustomerWithSales): CustomerWithStatsDTO {
    const stats = this.calculateStats(customer.sales || [])
    return this.toWithStatsDTO(customer, stats)
  }

  /**
   * Convert array of Customers to DTOs
   */
  static toDTOArray(customers: Customer[]): CustomerDTO[] {
    return customers.map(customer => this.toDTO(customer))
  }

  /**
   * Convert array of Customers to Summary DTOs
   */
  static toSummaryDTOArray(customers: Customer[]): CustomerSummaryDTO[] {
    return customers.map(customer => this.toSummaryDTO(customer))
  }
}
