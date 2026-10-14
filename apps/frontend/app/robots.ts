import { MetadataRoute } from 'next';

const BASE_URL = 'https://stylrr.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/account',
          '/checkout',
          '/dashboard',
          '/login',
          '/register',
          '/api', // Internal API routes
          "/cart"
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
