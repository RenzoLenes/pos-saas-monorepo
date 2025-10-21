import swaggerJsdoc from 'swagger-jsdoc'
import { env } from '@infrastructure/config/env'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'POS SaaS API',
      version: '1.0.0',
      description: `
# POS SaaS API Documentation

API REST completa para sistema Point of Sale (POS) multi-tenant.

## Características

- 🏢 **Multi-tenancy**: Soporte completo para múltiples organizaciones
- 🔐 **Autenticación JWT**: Integración con Clerk
- 🛒 **Gestión de Carritos**: Múltiples carritos por cajero
- 💰 **Ventas**: Completar ventas con múltiples métodos de pago
- 📦 **Inventario**: Gestión de stock por sucursal
- 👥 **Clientes**: CRM básico con historial de compras
- 📊 **Reportes**: Resúmenes de ventas diarios y por período

## Autenticación

Todos los endpoints (excepto webhooks) requieren autenticación mediante JWT token de Clerk.

\`\`\`
Authorization: Bearer YOUR_CLERK_JWT_TOKEN
\`\`\`

## Multi-tenancy

Todos los datos están aislados por tenant. El tenantId se obtiene automáticamente del token JWT del usuario autenticado.

## Modelos de Datos

### Entities
- **Tenant**: Organización principal
- **Outlet**: Sucursal física
- **User**: Usuario del sistema (admin, manager, cashier)
- **Product**: Producto del catálogo
- **Category**: Categoría de productos
- **Inventory**: Stock de productos por sucursal
- **Cart**: Carrito de compras activo
- **Sale**: Venta completada
- **Customer**: Cliente del negocio
      `,
      contact: {
        name: 'API Support',
        email: 'support@pos-saas.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api-staging.pos-saas.com',
        description: 'Staging server',
      },
      {
        url: 'https://api.pos-saas.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from Clerk authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Invalid input data',
                },
              },
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            sku: { type: 'string', nullable: true },
            barcode: { type: 'string', nullable: true },
            price: { type: 'number', format: 'decimal' },
            cost: { type: 'number', format: 'decimal', nullable: true },
            categoryId: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            isCustom: { type: 'boolean' },
            tenantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            tenantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email', nullable: true },
            phone: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            tenantId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid' },
            name: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['active', 'hold', 'completed', 'abandoned'] },
            subtotal: { type: 'number', format: 'decimal' },
            discount: { type: 'number', format: 'decimal' },
            total: { type: 'number', format: 'decimal' },
            userId: { type: 'string' },
            outletId: { type: 'string' },
            customerId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'cuid' },
            saleNumber: { type: 'string' },
            subtotal: { type: 'number', format: 'decimal' },
            discount: { type: 'number', format: 'decimal' },
            total: { type: 'number', format: 'decimal' },
            paymentMethod: { type: 'string', enum: ['cash', 'card', 'mixed'] },
            cashReceived: { type: 'number', format: 'decimal', nullable: true },
            change: { type: 'number', format: 'decimal', nullable: true },
            status: { type: 'string' },
            userId: { type: 'string' },
            outletId: { type: 'string' },
            customerId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management',
      },
      {
        name: 'Products',
        description: 'Product catalog management',
      },
      {
        name: 'Categories',
        description: 'Product categories',
      },
      {
        name: 'Carts',
        description: 'Shopping cart operations',
      },
      {
        name: 'Sales',
        description: 'Sales transactions and reports',
      },
      {
        name: 'Customers',
        description: 'Customer management',
      },
      {
        name: 'Inventory',
        description: 'Stock management per outlet',
      },
      {
        name: 'Outlets',
        description: 'Physical store locations',
      },
      {
        name: 'Users',
        description: 'User management',
      },
      {
        name: 'Tenants',
        description: 'Tenant/Organization settings',
      },
    ],
  },
  apis: ['./src/presentation/routes/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
