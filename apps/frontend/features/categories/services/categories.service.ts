import axiosInstance from "@/lib/http/axios";
import { QUERIES } from "@/queries/queries";
import { CategorySchemaType } from "../schema/categorySchema";
import { Category } from "../types/categories.types";
import { processUrlVariables } from "@/lib/utils";
import { fetcher } from "@/lib/http/fetch";
import { CATEGORIES_TAG } from "@/features/products/utils/cache-tags";

export const categoriesService = {
    // Fetch all categories
    getAllCategories: async (): Promise<Category[]> => {
        const response = await axiosInstance.get(QUERIES.admin.categories.GETNADD)
        return response.data.categories
    },
    addNewCategory: async (data: CategorySchemaType) => {
        const response = await axiosInstance.post(QUERIES.admin.categories.GETNADD, data)
        return response.data
    },
    getAllCategoriesPublic: async (): Promise<Category[]> => {
        const data = await fetcher.get<{ categories: Category[] }>(QUERIES.public.categories.GET, {
            next: { revalidate: 3600, tags: [CATEGORIES_TAG] }
        });
        return data.categories;
    },
    editCategory: async ({ data, id }: { data: CategorySchemaType, id: string }) => {
        const res = await axiosInstance.put(processUrlVariables(QUERIES.admin.categories.EDITNDEL, { id }), data)
        return res.data
    },
    deleteCategory: async (id: string) => {
        const res = await axiosInstance.delete(processUrlVariables(QUERIES.admin.categories.EDITNDEL, { id }))
        return res.data
    }
}