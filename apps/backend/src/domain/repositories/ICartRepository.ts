import type { Cart, CartItem, Product, Prisma } from '@prisma/client'

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product
  })[]
}

export interface ICartRepository {
  /**
   * Get active cart for user at outlet
   */
  getActiveCart(userId: string, outletId: string): Promise<CartWithItems | null>

  /**
   * Find carts by user and outlet with specific statuses
   */
  findByUserAndOutlet(
    userId: string,
    outletId: string,
    statuses: Array<'active' | 'hold' | 'completed' | 'abandoned'>
  ): Promise<CartWithItems[]>

  /**
   * Create new cart
   */
  createCart(data: {
    userId: string
    customerId?: string | null
    name?: string | null
    outletId: string
  }): Promise<Cart>

  /**
   * Find cart by ID with items
   */
  findById(cartId: string): Promise<CartWithItems | null>

  /**
   * Update cart
   */
  updateCart(cartId: string, data: Prisma.CartUpdateInput): Promise<Cart>

  /**
   * Delete cart
   */
  deleteCart(cartId: string): Promise<void>

  /**
   * Delete cart (alias for deleteCart)
   */
  delete(cartId: string): Promise<void>

  /**
   * Save cart entity
   */
  save(cart: any): Promise<any>

  /**
   * Add item to cart
   */
  addItem(data: {
    cartId: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }): Promise<CartItem>

  /**
   * Update cart item
   */
  updateItem(itemId: string, data: Prisma.CartItemUpdateInput): Promise<CartItem>

  /**
   * Delete cart item
   */
  deleteItem(itemId: string): Promise<void>

  /**
   * Delete all items from cart
   */
  deleteAllItems(cartId: string): Promise<void>

  /**
   * Find cart item
   */
  findItem(cartId: string, productId: string): Promise<CartItem | null>

  /**
   * Get cart item by ID
   */
  getItemById(itemId: string): Promise<CartItem | null>
}
