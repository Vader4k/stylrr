"use client"

import { ProductCardProps } from '@/features/products/types/product.types'
import DisplaySelector from './DisplaySelector'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUpdateParams } from '@/features/products/hooks/useUpdateParams'
import GridView from './GridView'
import ListView from './ListView'
import { AnimatePresence, motion } from 'framer-motion'

const ProductView = ({ products, limit, totalProducts }: { products: ProductCardProps[], limit: number, totalProducts: number }) => {

  const [display, setDisplay] = useState<'grid' | 'list'>('grid')
  const searchParams = useSearchParams()
  const updateParams = useUpdateParams()

  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page')) || 1
  const showingFrom = (page - 1) * limit + 1
  const showingTo = showingFrom + products.length - 1

  const handleLimitChange = (value: string) => {
    updateParams({
      limit: value,
    })
  }

  const handleSortChange = (value: string) => {
    updateParams({
      sort: value,
    })
  }

  return (
    <>
      <DisplaySelector
        display={display}
        setDisplay={setDisplay}
        handleLimitChange={handleLimitChange}
        handleSortChange={handleSortChange}
        limit={limit.toString()}
        totalProducts={totalProducts}
        showingFrom={showingFrom}
        showingTo={showingTo}
        sort={sort}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={display}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {display === 'grid' ? (
            <GridView products={products} />
          ) : (
            <ListView products={products} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default ProductView