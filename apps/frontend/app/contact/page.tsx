import ContactForm from "@/sections/contact/ContactForm"
import Image from "next/image"
import { Store, DoorOpen } from "lucide-react"
import { email, phone } from "@/constants"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Stylr team. We're here to help with your orders, styling questions, and feedback.",
  alternates: { canonical: "/contact" },
}

const page = () => {
    return (
        <main className="relative">
            <div className="xl:absolute w-full h-40 xl:h-90">
                <div className='w-full relative h-full'>
                    <Image title="clothes-linen-of-different-colors-and-quality-materials" priority src="/contact/contact-banner.jpg" alt="contact-banner" fill className="object-cover" />
                </div>
            </div>
            <div className="w-full max-w-[1400px] mx-auto px-3 flex flex-col xl:flex-row items-center justify-center gap-10 z-1 relative xl:pt-40 pt-5">
                {/* contact form */}
                <div className="w-full xl:w-[70%] bg-white xl:h-screen h-auto xl:py-20 py-0 xl:px-16 px-2">
                    <ContactForm />
                </div>
                {/* contact details */}
                <div className="w-full xl:w-[30%] font-jost xl:p-5 p-2">
                    <div className="grid gap-8">
                        {/* location */}
                        <div className="flex items-start gap-3">
                            <Store className="text-red-600" strokeWidth={0.8} size={35} />
                            <div className="grid gap-4 xl:mt-2">
                                <h3 className="font-medium">Stylr Store</h3>
                                <div className="text-sm">
                                    Germany — 785 15h Street, Office 478 /B
                                    Green Mall BErlin, De 81566
                                </div>
                                <div className="text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-light">Phone</span>
                                        <span>{phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-light">Email</span>
                                        <span className="text-red-600">{email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* opening hours */}
                        <div className="flex items-start gap-3">
                            <DoorOpen className="text-red-600" strokeWidth={0.8} size={35} />
                            <div className="grid gap-4 xl:mt-2">
                                <h3 className="font-medium">Opening Hours</h3>
                                <div className="text-sm">
                                    Monday — Friday: 09:am — 06:pm <br />
                                    Weekend Closed
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mb-20 w-full max-w-[1400px] mx-auto xl:px-20 px-5 space-y-4 mt-10 xl:mt-0">
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    At Stylr, we believe that exceptional customer service is the foundation of a truly great shopping experience. Our dedicated team is committed to assisting you with any inquiries you may have, from detailed product information and styling advice to order tracking and returns. We strive to ensure that every interaction with our brand is as seamless and helpful as possible, as your satisfaction remains our ultimate priority.
                </p>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    We are more than just a fashion destination; we are a community built on a shared passion for style, quality, and integrity. Your feedback is invaluable to us and plays a crucial role in how we grow and evolve. Whether you are reaching out for support or simply to share your thoughts, we appreciate your trust in Stylr and look forward to continuing this journey with you.
                </p>
            </div>
        </main>
    )
}

export default page