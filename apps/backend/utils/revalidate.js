// Tells the Next.js storefront to drop cached data for the given tags.
// Tag names must match apps/frontend/features/products/utils/cache-tags.ts.
export const PRODUCTS_TAG = "products";
export const CATEGORIES_TAG = "categories";

export const productTag = (slug) => `product:${slug}`;

// Fire-and-forget: a failed revalidation must never fail the admin or order
// request. Pages still refresh on the frontend's hourly fallback.
export const revalidateStorefront = (tags) => {
  const secret = process.env.REVALIDATE_SECRET;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!secret || !frontendUrl) return;

  fetch(`${frontendUrl.replace(/\/$/, "")}/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": secret,
    },
    body: JSON.stringify({ tags: [...new Set(tags)] }),
  }).catch((error) => {
    console.error("Storefront revalidation failed:", error.message);
  });
};
