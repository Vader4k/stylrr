import OrderTrackingPage from "@/features/order-tracking/components/OrderTrackingPage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the status of your Stylr order. Enter your Order Number and email to get real-time tracking updates with live map visualization.",
  alternates: { canonical: "/order-tracking" },
}

const page = () => {
  return (
    <main>
      <div className='w-full max-w-7xl mx-auto my-10 lg:my-20 px-5 xl:px-0'>
        <OrderTrackingPage />
      </div>
    </main>
  )
}

export default page