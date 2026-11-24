import { DisplaySelectorProps } from './types/shop.types'
import { LayoutGrid, List } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DisplaySelector = ({ display, setDisplay, handleLimitChange, handleSortChange, limit, sort, totalProducts, showingFrom, showingTo }: DisplaySelectorProps) => {

  return (
    <div className='hidden md:flex items-center justify-between'>
      <div className='flex items-center gap-6'>
        <div className='flex items-center gap-6'>
          <button title='Grid view' onClick={() => setDisplay('grid')} className={`cursor-pointer transition-colors ${display === 'grid' ? 'text-black' : 'text-gray-400'}`}><LayoutGrid size={18} strokeWidth={1.5} /></button>
          <button title='List view' onClick={() => setDisplay('list')} className={`cursor-pointer transition-colors ${display === 'list' ? 'text-black' : 'text-gray-400'}`}><List size={18} strokeWidth={1.5} /></button>
        </div>

        <div>
          <p className='text-xs text-gray-700 font-jost'>Showing 1 — {limit} of {totalProducts} products</p>
        </div>
      </div>

      <div className='flex items-center gap-6 text-sm font-jost'>
        <Select value={limit} onValueChange={handleLimitChange}>
          <SelectTrigger className='w-fit flex items-center gap-3'>
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="16">16 Items</SelectItem>
            <SelectItem value="24">24 Items</SelectItem>
            <SelectItem value="36">36 Items</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={handleSortChange}>
          <SelectTrigger className='w-fit border-r flex items-center gap-3'>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="sold">Best Selling</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default DisplaySelector