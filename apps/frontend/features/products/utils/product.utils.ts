import { ProductSchemaType } from "../schema/productSchema";

export const progressValue = ({ inventory, sold }: { inventory: { size: string; quantity: number }[], sold: number }) => {
  return (sold / inventory.reduce((acc, item) => acc + item.quantity, 0)) * 100
}

export const SHOP_LIMITS = [16, 24, 36]

export const normalizeParams = (
  params: Record<string, string | string[] | undefined>
) => {
  return {
    category:
      typeof params.category === "string" ? params.category : undefined,

    colors:
      typeof params.colors === "string" ? params.colors : undefined,

    sizes:
      typeof params.sizes === "string" ? params.sizes : undefined,

    page:
      typeof params.page === "string" && !isNaN(Number(params.page))
        ? Number(params.page)
        : 1,

    // only the page sizes the shop offers, so the URL can't request huge pages
    limit:
      typeof params.limit === "string" && SHOP_LIMITS.includes(Number(params.limit))
        ? Number(params.limit)
        : undefined,

    minPrice:
      typeof params.minPrice === "string"
        ? Number(params.minPrice)
        : undefined,

    maxPrice:
      typeof params.maxPrice === "string"
        ? Number(params.maxPrice)
        : undefined,
    
    sort:
      typeof params.sort === "string" ? params.sort : undefined,
  }
}

export const calculateTotalStock = (inventory: { size: string; quantity: number }[]) => {
  return inventory.reduce((acc, item) => acc + item.quantity, 0)
}

export const getProductStatus = (product: {
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isDiscount?: boolean;
  inventory: { size: string; quantity: number }[];
}) => {
  const totalStock = calculateTotalStock(product.inventory)

  if (totalStock === 0) return 'Out of Stock'
  if (totalStock < 10) return 'Low Stock'
  if (product.isBestSeller) return 'Best Seller'
  if (product.isNewArrival) return 'New Arrival'
  if (product.isTrending) return 'Trending'
  if (product.isDiscount) return 'Discount'

  return 'Active'
}

export const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800'
    case 'Low Stock': return 'bg-yellow-100 text-yellow-800'
    case 'Out of Stock': return 'bg-red-100 text-red-800'
    case 'Best Seller': return 'bg-purple-100 text-purple-800'
    case 'New Arrival': return 'bg-blue-100 text-blue-800'
    case 'Trending': return 'bg-orange-100 text-orange-800'
    case 'Discount': return 'bg-pink-100 text-pink-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const ToFormData = (data: ProductSchemaType): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'images' && Array.isArray(value)) {
      // Append images individually
      value.forEach((image) => {
        formData.append('images', image);
      });
    } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      // Stringify complex objects/arrays
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};