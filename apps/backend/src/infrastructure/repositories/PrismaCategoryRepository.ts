import { ICategoryRepository } from "@/domain/repositories";
import { Category, Prisma, PrismaClient } from "@prisma/client";

type DbClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>


export class PrismaCategoryRepository implements ICategoryRepository {
    constructor(private readonly db: DbClient) { }
    async getCategories(tenantId: string): Promise<Category[]> {
        return await this.db.category.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        }) as Category[]
    }
    async getCategoryById(categoryId: string, tenantId: string): Promise<Category | null> {
        return await this.db.category.findFirst({
            where: { id: categoryId, tenantId },
        }) as Category | null
    }
    async createCategory(data: { name: string; description?: string; tenantId: string; }): Promise<Category> {
        return await this.db.category.create({
            data: {
                name: data.name,
                description: data.description,
                tenantId: data.tenantId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        }) as Category
    }
    async updateCategory(categoryId: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return await this.db.category.update({
            where: { id: categoryId },
            data
        }) as Category
    }
    async deleteCategory(categoryId: string, tenantId: string): Promise<void> {
        await this.db.category.delete({
            where: { id: categoryId, tenantId }
        })
    }
}