import { PrismaClient } from '@prisma/client'
import { logger } from '../logger/logger'

const prisma = new PrismaClient()

export async function seedDatabase() {
  logger.info('Starting database seeding...')

  try {
    // 1. Create tenant
    const tenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo-pos' },
      update: {},
      create: {
        name: 'POS SaaS Demo',
        subdomain: 'demo-pos',
        plan: 'premium',
        status: 'active',
      }
    })
    logger.info(`✅ Tenant created: ${tenant.name}`)

    // 2. Create outlets
    const outlets = []

    // Check and create first outlet
    let outlet1 = await prisma.outlet.findFirst({
      where: {
        name: 'Sucursal Centro',
        tenantId: tenant.id
      }
    })

    if (!outlet1) {
      outlet1 = await prisma.outlet.create({
        data: {
          name: 'Sucursal Centro',
          address: 'Av. Principal 100, Centro',
          phone: '+1-555-1000',
          email: 'centro@demo-pos.com',
          status: 'active',
          currency: 'USD',
          locale: 'es-ES',
          timezone: 'America/Mexico_City',
          tenantId: tenant.id,
        }
      })
    }
    outlets.push(outlet1)

    // Check and create second outlet
    let outlet2 = await prisma.outlet.findFirst({
      where: {
        name: 'Sucursal Norte',
        tenantId: tenant.id
      }
    })

    if (!outlet2) {
      outlet2 = await prisma.outlet.create({
        data: {
          name: 'Sucursal Norte',
          address: 'Calle Norte 200, Zona Norte',
          phone: '+1-555-2000',
          email: 'norte@demo-pos.com',
          status: 'active',
          currency: 'USD',
          locale: 'es-ES',
          timezone: 'America/Mexico_City',
          tenantId: tenant.id,
        }
      })
    }
    outlets.push(outlet2)
    logger.info(`✅ Outlets created: ${outlets.map(o => o.name).join(', ')}`)

    // 3. Create product categories
    const categories = []
    const categoryData = [
      { name: 'Bebidas', description: 'Bebidas refrescantes y calientes' },
      { name: 'Panadería', description: 'Panes y productos horneados' },
      { name: 'Lácteos', description: 'Productos lácteos frescos' },
      { name: 'Granos', description: 'Cereales y legumbres' },
      { name: 'Snacks', description: 'Botanas y dulces' }
    ]

    for (const catData of categoryData) {
      let category = await prisma.category.findFirst({
        where: {
          name: catData.name,
          tenantId: tenant.id
        }
      })

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: catData.name,
            description: catData.description,
            tenantId: tenant.id,
          }
        })
      }
      categories.push(category)
    }
    logger.info(`✅ Categories created: ${categories.map(c => c.name).join(', ')}`)

    // 4. Create products
    const products = []
    const productData = [
      {
        name: 'Coca Cola 350ml',
        description: 'Bebida gaseosa refrescante',
        sku: 'CC-350-001',
        barcode: '7501055300151',
        price: 2.50,
        cost: 1.20,
        categoryIndex: 0
      },
      {
        name: 'Pan Integral',
        description: 'Pan integral rico en fibra',
        sku: 'PI-500-002',
        barcode: '7501234567890',
        price: 1.75,
        cost: 0.80,
        categoryIndex: 1
      },
      {
        name: 'Leche Entera 1L',
        description: 'Leche fresca pasteurizada',
        sku: 'LE-1L-003',
        barcode: '7501098765432',
        price: 3.25,
        cost: 2.00,
        categoryIndex: 2
      },
      {
        name: 'Café Molido 500g',
        description: 'Café premium molido',
        sku: 'CM-500-004',
        barcode: '7501876543210',
        price: 8.50,
        cost: 5.00,
        categoryIndex: 0
      },
      {
        name: 'Arroz Blanco 1kg',
        description: 'Arroz de primera calidad',
        sku: 'AB-1KG-005',
        barcode: '7501555123456',
        price: 2.80,
        cost: 1.50,
        categoryIndex: 3
      },
      {
        name: 'Galletas María',
        description: 'Galletas dulces María',
        sku: 'GM-200-006',
        barcode: '7501888999000',
        price: 1.20,
        cost: 0.60,
        categoryIndex: 4
      },
      {
        name: 'Agua Mineral 500ml',
        description: 'Agua mineral natural',
        sku: 'AM-500-007',
        barcode: '7501777888999',
        price: 1.00,
        cost: 0.50,
        categoryIndex: 0
      },
      {
        name: 'Yogurt Natural 1L',
        description: 'Yogurt natural sin azúcar',
        sku: 'YN-1L-008',
        barcode: '7501666777888',
        price: 4.50,
        cost: 2.50,
        categoryIndex: 2
      }
    ]

    for (const prodData of productData) {
      let product = await prisma.product.findFirst({
        where: {
          sku: prodData.sku,
          tenantId: tenant.id
        }
      })

      if (!product) {
        product = await prisma.product.create({
          data: {
            name: prodData.name,
            description: prodData.description,
            sku: prodData.sku,
            barcode: prodData.barcode,
            price: prodData.price,
            cost: prodData.cost,
            categoryId: categories[prodData.categoryIndex].id,
            isActive: true,
            tenantId: tenant.id,
          }
        })
      }
      products.push(product)
    }
    logger.info(`✅ Products created: ${products.length} products`)

    // 5. Create inventory for each product in each outlet
    const inventory = []
    for (const product of products) {
      for (const outlet of outlets) {
        let inv = await prisma.inventory.findFirst({
          where: {
            productId: product.id,
            outletId: outlet.id
          }
        })

        if (!inv) {
          inv = await prisma.inventory.create({
            data: {
              productId: product.id,
              outletId: outlet.id,
              quantity: Math.floor(Math.random() * 100) + 20, // 20-120 items
              minStock: 10,
              maxStock: 200,
            }
          })
        }
        inventory.push(inv)
      }
    }
    logger.info(`✅ Inventory created: ${inventory.length} entries`)

    // 6. Create sample customers
    const customers = []
    const customerData = [
      {
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@email.com',
        phone: '+1-555-0123',
        address: 'Av. Principal 123, Centro',
      },
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+1-555-0456',
        address: 'Calle Norte 456, Zona Norte',
      },
      {
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'ana.martinez@email.com',
        phone: '+1-555-0789',
        address: 'Av. Sur 789, Colonia Sur',
      },
      {
        firstName: 'Juan',
        lastName: 'López',
        email: 'juan.lopez@email.com',
        phone: '+1-555-0111',
        address: 'Calle Este 111, Colonia Este',
      }
    ]

    for (const custData of customerData) {
      let customer = await prisma.customer.findFirst({
        where: {
          email: custData.email,
          tenantId: tenant.id
        }
      })

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            ...custData,
            isActive: true,
            tenantId: tenant.id,
          }
        })
      }
      customers.push(customer)
    }
    logger.info(`✅ Customers created: ${customers.length} customers`)

    // 7. Create demo users (admin, manager, cashier)
    const users = []

    // Admin user
    let adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@demo-pos.com',
        tenantId: tenant.id
      }
    })

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          clerkId: 'user_32RT7rxEOyKDyccNZECa9iPkXqn',
          email: 'admin@demo-pos.com',
          firstName: 'Admin',
          lastName: 'Demo',
          role: 'admin',
          status: 'active',
          tenantId: tenant.id,
          outletId: null, // Admin has access to all outlets
        }
      })
    }
    users.push(adminUser)

    // Manager user
    let managerUser = await prisma.user.findFirst({
      where: {
        email: 'manager@demo-pos.com',
        tenantId: tenant.id
      }
    })

    if (!managerUser) {
      managerUser = await prisma.user.create({
        data: {
          clerkId: 'clerk_manager_demo_id',
          email: 'manager@demo-pos.com',
          firstName: 'Manager',
          lastName: 'Demo',
          role: 'manager',
          status: 'active',
          tenantId: tenant.id,
          outletId: null, // Manager can access multiple outlets
        }
      })
    }
    users.push(managerUser)

    // Cashier user for outlet 1
    let cashier1User = await prisma.user.findFirst({
      where: {
        email: 'cashier1@demo-pos.com',
        tenantId: tenant.id
      }
    })

    if (!cashier1User) {
      cashier1User = await prisma.user.create({
        data: {
          clerkId: 'clerk_cashier1_demo_id',
          email: 'cashier1@demo-pos.com',
          firstName: 'Cashier',
          lastName: 'Centro',
          role: 'cashier',
          status: 'active',
          tenantId: tenant.id,
          outletId: outlets[0].id, // Assigned to Sucursal Centro
        }
      })
    }
    users.push(cashier1User)

    // Cashier user for outlet 2
    let cashier2User = await prisma.user.findFirst({
      where: {
        email: 'cashier2@demo-pos.com',
        tenantId: tenant.id
      }
    })

    if (!cashier2User) {
      cashier2User = await prisma.user.create({
        data: {
          clerkId: 'clerk_cashier2_demo_id',
          email: 'cashier2@demo-pos.com',
          firstName: 'Cashier',
          lastName: 'Norte',
          role: 'cashier',
          status: 'active',
          tenantId: tenant.id,
          outletId: outlets[1].id, // Assigned to Sucursal Norte
        }
      })
    }
    users.push(cashier2User)

    logger.info(`✅ Users created: ${users.length} users (admin, manager, 2 cashiers)`)

    // 8. Create some sample sales
    const sampleSales = []

    // Check if sales already exist to avoid duplicates
    const existingSale1 = await prisma.sale.findFirst({
      where: { saleNumber: `SALE-${tenant.id}-001` }
    })

    if (!existingSale1) {
      const sale1 = await prisma.sale.create({
        data: {
          saleNumber: `SALE-${tenant.id}-001`,
          subtotal: 8.25,
          discount: 0,
          total: 8.25,
          paymentMethod: 'cash',
          cashReceived: 10.00,
          change: 1.75,
          status: 'completed',
          outletId: outlets[0].id,
          customerId: customers[0].id,
          userId: cashier1User.id,
          items: {
            create: [
              {
                productId: products[0].id, // Coca Cola
                quantity: 2,
                unitPrice: 2.50,
                totalPrice: 5.00
              },
              {
                productId: products[2].id, // Leche
                quantity: 1,
                unitPrice: 3.25,
                totalPrice: 3.25
              }
            ]
          }
        },
        include: {
          items: true
        }
      })
      sampleSales.push(sale1)
    }

    const existingSale2 = await prisma.sale.findFirst({
      where: { saleNumber: `SALE-${tenant.id}-002` }
    })

    if (!existingSale2) {
      const sale2 = await prisma.sale.create({
        data: {
          saleNumber: `SALE-${tenant.id}-002`,
          subtotal: 8.50,
          discount: 5,
          total: 8.08,
          paymentMethod: 'card',
          status: 'completed',
          outletId: outlets[1].id,
          customerId: customers[1].id,
          userId: cashier2User.id,
          items: {
            create: [
              {
                productId: products[3].id, // Café
                quantity: 1,
                unitPrice: 8.50,
                totalPrice: 8.50
              }
            ]
          }
        },
        include: {
          items: true
        }
      })
      sampleSales.push(sale2)
    }

    const existingSale3 = await prisma.sale.findFirst({
      where: { saleNumber: `SALE-${tenant.id}-003` }
    })

    if (!existingSale3) {
      const sale3 = await prisma.sale.create({
        data: {
          saleNumber: `SALE-${tenant.id}-003`,
          subtotal: 12.95,
          discount: 10,
          total: 11.66,
          paymentMethod: 'mixed',
          cashReceived: 6.00,
          status: 'completed',
          outletId: outlets[0].id,
          customerId: customers[2].id,
          userId: cashier1User.id,
          items: {
            create: [
              {
                productId: products[4].id, // Arroz
                quantity: 2,
                unitPrice: 2.80,
                totalPrice: 5.60
              },
              {
                productId: products[5].id, // Galletas
                quantity: 3,
                unitPrice: 1.20,
                totalPrice: 3.60
              },
              {
                productId: products[1].id, // Pan
                quantity: 2,
                unitPrice: 1.75,
                totalPrice: 3.50
              }
            ]
          }
        },
        include: {
          items: true
        }
      })
      sampleSales.push(sale3)
    }

    logger.info(`✅ Sample sales created: ${sampleSales.length} sales`)

    logger.info('Database seeding completed successfully!')
    logger.info(`
📊 Seeded data summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Tenant: ${tenant.name}
✓ Outlets: ${outlets.length}
✓ Categories: ${categories.length}
✓ Products: ${products.length}
✓ Inventory entries: ${inventory.length}
✓ Customers: ${customers.length}
✓ Users: ${users.length} (1 admin, 1 manager, 2 cashiers)
✓ Sample sales: ${sampleSales.length}

👥 Demo users:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin:    admin@demo-pos.com
Manager:  manager@demo-pos.com
Cashier1: cashier1@demo-pos.com (Sucursal Centro)
Cashier2: cashier2@demo-pos.com (Sucursal Norte)
`)

    return {
      tenant,
      outlets,
      categories,
      products,
      inventory,
      customers,
      users,
      sampleSales
    }

  } catch (error) {
    logger.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Function to clear all data (useful for development)
export async function clearDatabase() {
  logger.info('Clearing database...')

  try {
    // Delete in correct order due to foreign key constraints
    await prisma.saleItem.deleteMany()
    logger.info('  ✓ Sale items deleted')

    await prisma.sale.deleteMany()
    logger.info('  ✓ Sales deleted')

    await prisma.cartItem.deleteMany()
    logger.info('  ✓ Cart items deleted')

    await prisma.cart.deleteMany()
    logger.info('  ✓ Carts deleted')

    await prisma.inventory.deleteMany()
    logger.info('  ✓ Inventory deleted')

    await prisma.product.deleteMany()
    logger.info('  ✓ Products deleted')

    await prisma.category.deleteMany()
    logger.info('  ✓ Categories deleted')

    await prisma.customer.deleteMany()
    logger.info('  ✓ Customers deleted')

    await prisma.user.deleteMany()
    logger.info('  ✓ Users deleted')

    await prisma.outlet.deleteMany()
    logger.info('  ✓ Outlets deleted')

    await prisma.tenant.deleteMany()
    logger.info('  ✓ Tenants deleted')

    logger.info('Database cleared successfully!')
  } catch (error) {
    logger.error('Error clearing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
