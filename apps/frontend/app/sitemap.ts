import { MetadataRoute } from 'next';
import { QUERIES } from '@/queries/queries';
import { Product } from '@/features/products/types/product.types';
import { BlogCardProps } from '@/features/blogs/types/blog.types';
import { PRODUCTS_TAG } from '@/features/products/utils/cache-tags';

const BASE_URL = 'https://stylrr.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stylrr.vercel.app'; // Fallback if not defined
const PAGE_SIZE = 100;

type Paginated = { pagination?: { totalPages?: number } };

// The public list endpoints are paginated, so walk every page rather than
// only indexing the first one. Pages after the first are fetched in parallel.
async function fetchAll<T>(path: string, key: string, tags: string[] = []): Promise<T[]> {
  const fetchPage = async (page: number) => {
    const response = await fetch(`${API_URL}${path}?page=${page}&limit=${PAGE_SIZE}`, {
      next: { revalidate: 86400, tags },
    });
    if (!response.ok) throw new Error(`${path} page ${page}: ${response.status}`);
    return response.json() as Promise<Paginated & Record<string, T[]>>;
  };

  const first = await fetchPage(1);
  const totalPages = first.pagination?.totalPages ?? 1;
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2)),
  );

  return [first, ...rest].flatMap((data) => data[key] ?? []);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes (no lastModified: a build timestamp would tell crawlers
  // these pages change on every deploy, so they learn to ignore the field)
  const staticRoutes = [
    '',
    '/shop',
    '/blog',
    '/compare',
    '/contact',
    '/order-tracking',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Product Routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await fetchAll<Product>(QUERIES.public.products.GET_ALL, 'products', [PRODUCTS_TAG]);
    productRoutes = products.map((product) => ({
      url: `${BASE_URL}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // 3. Dynamic Blog Routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await fetchAll<BlogCardProps>(QUERIES.public.blogs.GET_ALL, 'blogs');
    blogRoutes = blogs.map((blog) => ({
      url: `${BASE_URL}/blog/${blog.slug}`,
      lastModified: blog.updatedAt ? new Date(blog.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
