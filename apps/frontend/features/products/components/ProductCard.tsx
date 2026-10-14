import { Star } from "lucide-react"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { progressValue } from "@/features/products/utils/product.utils"
import { ProductCardProps } from "../types/product.types"
import ProductActions from "./ProductActions"
import { ProductPrice } from "@/features/currency/components/ProductPrice"


const ProductCard = ({ name, _id, price, images, reviews, discountPrice, discountPercentage, inventory, sold, slug, showRange, isShopPage }: ProductCardProps) => {
  return (
    <div className={`w-full h-100 sm:h-120 lg:h-200 xl:h-140 flex flex-col justify-between gap-2 relative group ${isShopPage ? 'xl:h-100!' : ''}`}>
      <a href={`/product/${slug}`} className="w-full h-[85%] xl:h-[85%]">
        <div className="relative w-full h-full group">
          <Image src={images[0]} alt={name} fill className="object-cover object-top z-1" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          {images[1] && <Image src={images[1]} alt={name} fill className="object-cover object-top absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:z-2" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />}
        </div>
      </a>
      {discountPercentage ? (
        <div className="absolute top-2 z-5 left-2 bg-white text-xs text-green-600 font-medium font-jost px-2.5 py-1 rounded">
          {discountPercentage}%
        </div>
      ) : null}
      <p className="font-jost capitalize text-xs sm:text-base line-clamp-1">{name}</p>
      <div className="text-sm">
        {discountPrice ? (
          <div className="flex items-center gap-3">
            <ProductPrice price={price} className="font-jost line-through text-gray-300 font-light" />
            <ProductPrice price={discountPrice} className="font-jost font-medium" />
          </div>
        ) : (
          <ProductPrice price={price} className="font-jost font-medium" />
        )}
      </div>
      <div className="flex items-center gap-3">
        <Star size={14} fill="gold" stroke="gold" />
        <p className="text-xs font-semibold">{reviews || 0} review</p>
      </div>


      {inventory && typeof sold === 'number' && showRange ? (
        <div className="font-jost mt-1">
          <Progress value={progressValue({ inventory, sold })} />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-400">Available: {inventory.reduce((acc, item) => acc + item.quantity, 0)}</p>
            <p className="text-xs">Sold: <span className="font-medium text-red-600">{sold}</span></p>
          </div>
        </div>
      ) : null}


      <div className="absolute right-3 top-3 z-10">
        <ProductActions
          slug={slug}
          id={_id}
          name={name}
          image={images[0]}
          rating={reviews}
          price={price}
          discountPrice={discountPrice} />
      </div>
    </div>
  )
}

export default ProductCard