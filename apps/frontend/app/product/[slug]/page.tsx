import Breadcrumb from "@/sections/product/Breadcrumb"
import DetailedInformation from "@/sections/product/DetailedInformation"
import ImageDisplay from "@/sections/product/ImageDisplay"
import { productServices } from "@/features/products/services/product.service"
import RecentViews from "@/sections/product/RecentViews"
import DetailsView from "@/sections/product/DetailsView"
import RelatedProducts from "@/sections/product/RelatedProducts"
import RecentlyViewedTracker from "@/features/recently-viewed/services/recently-viewed-tracker"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await productServices.getBySlug(slug).catch(() => undefined)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      url: `/product/${product.slug}`,
      title: `${product.name} | Stylr`,
      description: product.shortDescription,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription || product.description,
      images: [product.images[0]],
    },
  }
}

const ProductPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const product = await productServices.getBySlug(slug).catch(() => undefined)

  if (!product) {
    notFound()
  }

  const relatedProducts = await productServices.getRelated(product._id)

  return (
    <main className='w-full max-w-7xl mx-auto px-3 sm:px-10 lg:px-14 xl:px-5'>
      <RecentlyViewedTracker product={product} />
      <div className="mb-8 mt-4">
        {product.category && product.tags &&
          <Breadcrumb category={product.category} tags={product.tags} name={product.name} />
        }
      </div>
      <div className="w-full flex flex-col xl:flex-row items-start justify-between gap-10">
        <div className="w-full xl:max-w-[45%]">
          <ImageDisplay images={product?.images || []} name={product.name} />
        </div>
        <div className="w-full xl:max-w-[35%]">
          <DetailedInformation product={product} />
        </div>
        {/* recent views */}
        <div className="w-full xl:max-w-[20%]">
          <RecentViews currentProductId={product._id} />
        </div>
      </div>

      {/* description, reviews */}
      <div className="my-14">
        <DetailsView reviews={product.reviews} name={product.name} description={product.description as string} />
      </div>

      {/* related products */}
      {relatedProducts.length > 0 && <div className="my-14">
        <RelatedProducts products={relatedProducts} />
      </div>}
    </main>
  )
}

export default ProductPage