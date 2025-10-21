import type { PrismaClient, Cart, CartItem, Prisma } from '@prisma/client'
import type { ICartRepository, CartWithItems } from '@/domain/repositories'

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly db: DbClient) {}

  async getActiveCart(userId: string, outletId: string): Promise<CartWithItems | null> {
    return await this.db.cart.findFirst({
      where: {
        userId,
        outletId,
        status: 'active',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }) as CartWithItems | null
  }

  async findByUserAndOutlet(
    userId: string,
    outletId: string,
    statuses: Array<'active' | 'hold' | 'completed' | 'abandoned'>
  ): Promise<CartWithItems[]> {
    return await this.db.cart.findMany({
      where: {
        userId,
        outletId,
        status: { in: statuses },
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        customer: true,
      },
      orderBy: { updatedAt: 'desc' },
    }) as CartWithItems[]
  }

  async createCart(data: {
    userId: string
    outletId: string
    name?: string | null
    customerId?: string | null
  }): Promise<Cart> {
    return await this.db.cart.create({
      data: {
        userId: data.userId,
        outletId: data.outletId,
        customerId: data.customerId || null,
        name: data.name || null,
        status: 'active',
        subtotal: 0,
        discount: 0,
        total: 0,
        syncStatus: 'synced',
      },
    })
  }

  async findById(cartId: string): Promise<CartWithItems | null> {
    return await this.db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }) as CartWithItems | null
  }

  async updateCart(cartId: string, data: Prisma.CartUpdateInput): Promise<Cart> {
    return await this.db.cart.update({
      where: { id: cartId },
      data,
    })
  }

  async deleteCart(cartId: string): Promise<void> {
    await this.db.cart.delete({
      where: { id: cartId },
    })
  }

  async delete(cartId: string): Promise<void> {
    await this.deleteCart(cartId)
  }

  async save(cart: any): Promise<any> {
    // Convert domain entity to persistence format
    const persistenceData = cart.toPersistence()

    // Update the cart
    await this.db.cart.update({
      where: { id: persistenceData.id },
      data: {
        status: persistenceData.status,
        customerId: persistenceData.customerId,
        name: persistenceData.name,
        subtotal: persistenceData.subtotal,
        discount: persistenceData.discount,
        total: persistenceData.total,
        syncStatus: 'synced',
      },
    })

    // Return updated cart with items
    return await this.findById(persistenceData.id)
  }

  async addItem(data: {
    cartId: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }): Promise<CartItem> {
    return await this.db.cartItem.create({
      data,
    })
  }

  async updateItem(itemId: string, data: Prisma.CartItemUpdateInput): Promise<CartItem> {
    return await this.db.cartItem.update({
      where: { id: itemId },
      data,
    })
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.db.cartItem.delete({
      where: { id: itemId },
    })
  }

  async deleteAllItems(cartId: string): Promise<void> {
    await this.db.cartItem.deleteMany({
      where: { cartId },
    })
  }

  async findItem(cartId: string, productId: string): Promise<CartItem | null> {
    return await this.db.cartItem.findFirst({
      where: {
        cartId,
        productId,
      },
    })
  }

  async getItemById(itemId: string): Promise<CartItem | null> {
    return await this.db.cartItem.findUnique({
      where: { id: itemId },
    })
  }
}
