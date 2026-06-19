import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import ShopByApplication from '@/components/home/ShopByApplication'
import ShopByProfile from '@/components/home/ShopByProfile'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import Gallery from '@/components/home/Gallery'
import Testimonials from '@/components/home/Testimonials'
import Newsletter from '@/components/home/Newsletter'
import Stats from '@/components/home/Stats'

export const metadata: Metadata = {
  title: 'LED Profile Decorations — Architectural LED Lighting Excellence',
  description:
    'Premium LED aluminum profiles and architectural linear lighting solutions. Recessed, surface-mounted, corner, suspended, and trimless profiles for luxury residential and commercial projects.',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturedProducts />
      <ShopByApplication />
      <ShopByProfile />
      <WhyChooseUs />
      <Gallery />
      <Testimonials />
      <Newsletter />
    </>
  )
}
