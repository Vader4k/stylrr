import { AdminProductFilters, ProductFilters, AdminProductResponse, Product, PublicProductResponse } from "../types/product.types";
import { QUERIES } from "@/queries/queries";
import axiosInstance from "@/lib/http/axios";
import { processUrlVariables } from "@/lib/utils";
import { ProductSchemaType } from "../schema/productSchema";
import { ToFormData } from "../utils/product.utils";
import { fetcher } from "@/lib/http/fetch";
import { PRODUCTS_TAG, productTag } from "../utils/cache-tags";


export const adminProductServices = {
    getAll: async (filter?: AdminProductFilters): Promise<AdminProductResponse> => {
        const response = await axiosInstance.get(QUERIES.admin.products.GETNADD, {
            params: {
                ...filter
            }
        });
        return response.data;
    },

    add: async (product: ProductSchemaType): Promise<ProductSchemaType> => {
        const formData = ToFormData(product);
        const response = await axiosInstance.post(QUERIES.admin.products.GETNADD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    edit: async (id: string, product: ProductSchemaType): Promise<ProductSchemaType> => {
        const formData = ToFormData(product);
        const response = await axiosInstance.put(
            processUrlVariables(QUERIES.admin.products.EDITNDEL, { id }),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data.product;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await axiosInstance.delete(
            processUrlVariables(QUERIES.admin.products.EDITNDEL, { id })
        );
        return response.data;
    },
}

export const productServices = {
    // get all products
    getAll: async (filters: ProductFilters): Promise<PublicProductResponse> => {
        return await fetcher.get<PublicProductResponse>(QUERIES.public.products.GET_ALL, {
            params: { ...filters },
            next: { revalidate: 3600, tags: [PRODUCTS_TAG] }
        });
    },

    // get product by slug
    getBySlug: async (slug: string): Promise<Product | undefined> => {
        const url = processUrlVariables(QUERIES.public.products.GET_BY_SLUG, { slug });
        // cached until the backend revalidates this product's tag; the hour is a fallback
        const data = await fetcher.get<{ product: Product }>(url, {
            next: { revalidate: 3600, tags: [PRODUCTS_TAG, productTag(slug)] }
        });
        return data.product;
    },

    getByCategory: async (category: string): Promise<Product[]> => {
        const url = processUrlVariables(QUERIES.public.products.GET_BY_CATEGORY, { category });
        const data = await fetcher.get<{ products: Product[] }>(url, {
            next: { revalidate: 3600, tags: [PRODUCTS_TAG] }
        });
        return data.products;
    },

    // get products by search
    getBySearch: async (search: string): Promise<Product[]> => {
        const url = processUrlVariables(QUERIES.public.products.GET_BY_SEARCH, { search });
        const data = await fetcher.get<{ products: Product[] }>(url, {
            cache: 'no-store' // Don't cache search results
        });
        return data.products;
    },

    //get best seller products
    getBestSeller: async (): Promise<Product[]> => {
        const data = await fetcher.get<{ products: Product[] }>(QUERIES.public.products.GET_BEST_SELLER, {
            next: { revalidate: 3600, tags: [PRODUCTS_TAG] }
        });
        return data.products;
    },

    // get related products
    getRelated: async (id: string): Promise<Product[]> => {
        const url = processUrlVariables(QUERIES.public.products.GET_RELATED, { id });
        const data = await fetcher.get<{ products: Product[] }>(url, {
            next: { revalidate: 3600, tags: [PRODUCTS_TAG] }
        });
        return data.products;
    },
};
