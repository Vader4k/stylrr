import { MetadataRoute } from 'next';
import { QUERIES } from '@/queries/queries';
import { Product } from '@/features/products/types/product.types';
import { BlogCardProps } from '@/features/blogs/types/blog.types';

const BASE_URL = 'https://stylrr.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stylrr.vercel.app'; // Fallback if not defined

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Routes
  const staticRoutes = [
    '',
    '/shop',
    '/blog',
    '/compare',
    '/contact',
    '/order-tracking',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Product Routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${API_URL}${QUERIES.public.products.GET_ALL}`, {
        next: { revalidate: 86400 } // Revalidate daily
    });
    if (response.ok) {
        const products = await response.json();
        productRoutes = products.products.map((product: Product) => ({
            url: `${BASE_URL}/product/${product.slug}`,
            lastModified: new Date(product.updatedAt || new Date()),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // 3. Dynamic Blog Routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${API_URL}${QUERIES.public.blogs.GET_ALL}`, {
        next: { revalidate: 86400 } // Revalidate daily
    });
    if (response.ok) {
        const data = await response.json();
        blogRoutes = data.blogs.map((blog: BlogCardProps) => ({
            url: `${BASE_URL}/blog/${blog.slug}`,
            lastModified: new Date(blog.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    }
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
