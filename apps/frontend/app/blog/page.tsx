import BlogDisplay from '@/sections/blog/BlogDisplay'
import BlogFilters from '@/sections/blog/BlogFilters'
import { blogService } from '@/features/blogs/services/blog.service'
import { Metadata } from 'next'
import { BlogPageProps } from '@/features/blogs/types/blog.types'

export const metadata: Metadata = {
  title: "Fashion Blog & Styling Tips",
  description: "Stay updated with the latest fashion trends, styling tips, and industry news on the stylr blog.",
  alternates: { canonical: "/blog" },
}

const BlogPage = async({ searchParams }: BlogPageProps) => {
  const resolvedParams = await searchParams;
  const filters = {
    categories: resolvedParams.category,
    tags: resolvedParams.tag,
    search: resolvedParams.search,
    page: resolvedParams.page ? Number(resolvedParams.page) : 1,
  };

  const [blogResponse, popularPosts, categories, tags] = await Promise.all([
    blogService.getAll(filters),
    blogService.getPopularPosts(),
    blogService.getCategories(),
    blogService.getTags(),
  ])
  const blogPosts = blogResponse.blogs;


  return (
    <main className='w-full h-full'>
      <div className='w-full max-w-7xl mx-auto xl:my-14 my-8 px-3 md:px-14 lg:px-10 xl:px-3 flex flex-col lg:flex-row items-start justify-between xl:gap-14 gap-8'>
        <div className='w-full lg:w-[75%]'>
          <BlogDisplay blogPosts={blogPosts}/>
        </div>
        <aside className='w-full lg:w-[25%] sticky top-5'>
          <BlogFilters popularPosts={popularPosts} categories={categories} tags={tags}/>
        </aside>
      </div>
    </main>
  )
}

export default BlogPage