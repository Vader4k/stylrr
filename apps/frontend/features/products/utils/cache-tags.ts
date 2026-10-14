// Cache tags for storefront product fetches. The backend sends these same
// strings to /revalidate when product data changes, so keep the two in sync.
export const PRODUCTS_TAG = "products"
export const CATEGORIES_TAG = "categories"

export const productTag = (slug: string) => `product:${slug}`
