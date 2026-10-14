import Advert from '@/sections/home/Advert'
import BestSeller from '@/sections/home/BestSeller'
import Categories from '@/sections/home/Categories'
import CategoryGrid from '@/sections/home/CategoryGrid'
import Contact from '@/sections/home/Contact'
import Hero from '@/sections/home/Hero'
import News from '@/sections/home/News'
import { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const page = () => {
  return (
    <main className='grid gap-10 lg:gap-18'>
      <Hero />
      <div className='w-full max-w-7xl mx-auto px-3 min-w-0'>
        <BestSeller variant='wide' />
        <CategoryGrid />
        <Categories />
        <Advert />
        <BestSeller variant='close' />
        <News />
        <Contact />
      </div>
    </main>
  )
}

export default page