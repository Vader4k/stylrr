import CompareView from "@/features/compare/components/CompareView"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compare Products",
  description: "Compare features, prices, and ratings of your favorite fashion items at stylr to make the best choice.",
  alternates: { canonical: "/compare" },
}

const ComparePage = () => {
  return (
    <main className="w-full px-4 md:px-8 py-10 xl:py-16 font-jost">
      <h1 className="text-2xl font-semibold mb-8">Compare Products</h1>
      <CompareView />
    </main>
  )
}

export default ComparePage