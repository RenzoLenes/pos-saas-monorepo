import { Category, Prisma } from "@prisma/client";

export interface ICategoryRepository{

    getCategories (tenantId: string): Promise<Category[]>;

    getCategoryById (categoryId: string, tenantId: string): Promise<Category | null>;

    createCategory(data:{
        name: string;
        description?: string;
        tenantId: string;
    }): Promise<Category>;

    updateCategory(categoryId: string, data: Prisma.CategoryUpdateInput): Promise<Category>;

    deleteCategory(categoryId: string, tenantId: string): Promise<void>;

}