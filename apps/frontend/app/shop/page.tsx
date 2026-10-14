import { productServices } from "@/features/products/services/product.service";
import { normalizeParams } from "@/features/products/utils/product.utils";
import Banner from "@/sections/shop/Banner";
import ProductView from "@/sections/shop/ProductView";
import { PageProp } from "@/sections/shop/types/shop.types";
import FiltersPanel from "@/features/products/components/FiltersPanel";
import { categoriesService } from "@/features/categories/services/categories.service";
import Pagination from "@/features/products/components/Pagination";
import EmptyShopView from "@/features/products/components/EmptyShopView";
import { Metadata } from "next";

export async function generateMetadata({ searchParams }: PageProp): Promise<Metadata> {
  const { page } = await searchParams
  const pageNumber = Number(page) || 1

  return {
    title: "Shop All Collections",
    description: "Browse our extensive collection of fashion and accessories. Filter by category, price, color, and size to find your perfect fit.",
    // filter and sort params collapse to the base listing; pagination keeps its own URL
    alternates: {
      canonical: pageNumber > 1 ? `/shop?page=${pageNumber}` : "/shop",
    },
  }
}

const page = async ({ searchParams }: PageProp) => {
  const resolvedSearchParams = await searchParams;
  const filters = normalizeParams(resolvedSearchParams);
  // independent requests, so fetch them together instead of one after the other
  const [products, categories] = await Promise.all([
    productServices.getAll(filters),
    categoriesService.getAllCategoriesPublic(),
  ]);

  const totalPages = products.pagination.totalPages;
  const currentPage = Number(resolvedSearchParams.page) || 1;

  return (
    <main className="w-full max-w-7xl mx-auto my-6 2xl:my-14 px-3 sm:px-5 xl:px-5">
      <div className="flex items-start gap-20">
        <div className="w-full flex-1 min-h-screen hidden xl:block">
          <FiltersPanel categories={categories} />
        </div>
        <div className="w-full flex-4 grid gap-6">
          <Banner />
          {products.products.length === 0 ? (
            <EmptyShopView />
          ) : (
            <ProductView products={products.products} limit={products.pagination.limit} totalProducts={products.pagination.totalProducts} />
          )}
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </div>
    </main>
  );
};

export default page;
