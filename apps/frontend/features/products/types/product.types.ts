import { Category } from "@/features/categories/types/categories.types";
import { ProductSchemaType } from "../schema/productSchema";

/** 
 * Section 1: Core & Base Types 
 */

export type Color = {
    name: string;
    hex: string;
};

export interface InventoryItem {
    size: string;
    quantity: number;
}

/**
 * Base interface for all product variants
 */
export interface BaseProduct {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    discountPrice?: number;
    discountPercentage?: number;
    images: string[];
    isBestSeller: boolean;
    shortDescription: string;
    description: string;
    colors?: Color[];
    inventory: InventoryItem[];
}

/** 
 * Section 2: Specialized Product Variants 
 */

/** Props for ProductCard and other lightweight UI components */
export interface ProductCardProps extends Pick<BaseProduct, 
    '_id' | 'name' | 'price' | 'images' | 'discountPrice' | 'discountPercentage' | 'isBestSeller' | 'slug' | 'shortDescription'
> {
    reviews: number;
    inventory?: InventoryItem[];
    sold?: number;
    showRange?: boolean;
    isShopPage?: boolean;
}

/** Full Product object for public-facing views (Product Details, etc.) */
export interface Product extends BaseProduct {
    category: {
        name: string;
        slug: string;
    }[];
    tags?: {
        _id: string;
        name: string;
    }[];
    reviews: number;
    updatedAt: string;
}

/** Product object for Admin views, includes metadata and complex reviews */
export interface AdminProduct extends Omit<ProductSchemaType, "category" | "tags"> {
    _id: string;
    createdAt: string;
    updatedAt: string;
    sold: number;
    reviews: {
        average: number;
        count: number;
    };
    category: {
        _id: string;
        name: string;
    }[];
    tags: {
        _id: string;
        name: string;
    }[];
}

/** 
 * Section 3: API & Filtration Types 
 */

export type ProductFilters = {
    category?: string;
    colors?: string;
    sizes?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
};

export type AdminProductFilters = {
    page?: number;
    limit?: number;
    search?: string;
};

export interface PaginationData {
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    limit: number;
}

export type AdminProductResponse = {
    products: AdminProduct[];
    pagination: PaginationData;
};

export type PublicProductResponse = {
    products: Product[];
    pagination: PaginationData;
};

/** 
 * Section 4: Component Prop Interfaces 
 */

export interface FilterProps {
    categories: Category[];
    selectedCategories: string;
    setSelectedCategories: (categories: string) => void;
}

export interface PriceFilterProps {
    price?: number[];
    setPrice?: (price: number[]) => void;
    onFilter?: (price: number[]) => void;
}

export type ProductActionsProps = {
    slug: string;
    id: string;
    name: string;
    image: string;
    rating: number;
    price: number;
    discountPrice?: number;
};

export type ProductFormSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ProductSchemaType) => Promise<void>;
    initialData?: Partial<ProductSchemaType> | AdminProduct;
    title: string;
    description: string;
    refetch: () => void;
};

export interface AdminProductTableProps {
    products: AdminProductResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    onEdit: (product: AdminProduct) => void;
    onDelete: (product: AdminProduct) => void;
}

export interface AdminProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export interface AdminProductSearchProps {
    value: string;
    onChange: (value: string) => void;
}

export interface AdminProductLimitSelectProps {
    limit: number;
    onLimitChange: (limit: string) => void;
}

export interface ImageUploaderProps {
    value?: (string | File)[];
    onChange?: (urls: (string | File)[]) => void;
}

export interface ImageLightboxProps {
    images: string[]
    currentIndex: number
    setIndex: (index: number) => void
    isOpen: boolean
    onClose: () => void
    name: string
}