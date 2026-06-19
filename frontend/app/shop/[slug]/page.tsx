'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, ShoppingBag, Share2, Star, ChevronLeft, ChevronRight,
  Download, Check, Minus, Plus, ArrowRight, Info, Truck, Shield, RotateCcw,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice } from '@/lib/utils'
import { FEATURED_PRODUCTS } from '@/lib/constants'
import ProductCard from '@/components/shop/ProductCard'
import toast from 'react-hot-toast'

const mockProduct = {
  id: '1',
  slug: 'lux-recessed-35-slim',
  name: 'LUX Recessed 35 Slim',
  shortDescription: 'Ultra-slim recessed profile for invisible ceiling integration',
  description: `The LUX Recessed 35 Slim represents the pinnacle of architectural LED profile engineering. Designed for complete invisibility within ceiling planes, this profile delivers seamless linear light with zero visible hardware.

Machined from 6063-T5 anodized aluminum alloy, the profile maintains dimensional stability across temperature ranges from -20°C to +60°C. The ultra-slim 35mm opening conceals our proprietary heat-dissipation fins, ensuring LED longevity exceeding 50,000 hours.

Compatible with all LED strips from 8mm to 12mm width. Available in cut lengths from 300mm to 6000mm with precision end caps included. The integrated spring-clip system enables tool-free LED strip installation.`,
  price: 48.90,
  compareAtPrice: 62.00,
  images: [
    'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1200&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1200&q=85&auto=format&fit=crop',
  ],
  category: 'recessed',
  sku: 'LUX-R35S-2M',
  inStock: true,
  stockQuantity: 247,
  rating: 4.9,
  reviewCount: 127,
  isFeatured: true,
  isBestseller: true,
  isNew: false,
  specifications: [
    { label: 'Profile Material', value: '6063-T5 Anodized Aluminum' },
    { label: 'Opening Width', value: '35mm' },
    { label: 'Profile Height', value: '14mm' },
    { label: 'Profile Depth', value: '68mm' },
    { label: 'LED Strip Width', value: '8mm — 12mm' },
    { label: 'Max Wattage', value: '25W/m' },
    { label: 'Heat Dissipation', value: 'Integrated fins, rated to 25W/m' },
    { label: 'Diffuser Material', value: 'Extruded PMMA' },
    { label: 'IP Rating', value: 'IP20 (IP67 with sealed kit)' },
    { label: 'Working Temp', value: '-20°C to +60°C' },
    { label: 'Warranty', value: '5 Years' },
    { label: 'Certification', value: 'CE, RoHS, UL' },
  ],
  finishes: [
    { id: 'anodized-silver', name: 'Anodized Silver', color: '#C0C0C0' },
    { id: 'anodized-black', name: 'Anodized Black', color: '#1a1a1a' },
    { id: 'matte-white', name: 'Matte White', color: '#F5F5F5' },
    { id: 'brushed-gold', name: 'Brushed Gold', color: '#C9A84C' },
  ],
  lengths: [
    { value: 1000, unit: 'mm', label: '1m', price: 48.90 },
    { value: 2000, unit: 'mm', label: '2m', price: 97.80 },
    { value: 3000, unit: 'mm', label: '3m', price: 146.70 },
    { value: 6000, unit: 'mm', label: '6m', price: 293.40 },
  ],
  downloads: [
    { type: 'CAD', label: 'AutoCAD Drawing (.DWG)', url: '#', size: '1.2 MB' },
    { type: 'IES', label: 'IES Photometric File', url: '#', size: '84 KB' },
    { type: 'PDF', label: 'Installation Guide', url: '#', size: '2.8 MB' },
    { type: 'PDF', label: 'Product Datasheet', url: '#', size: '1.5 MB' },
  ],
}

const mockReviews = [
  {
    id: '1',
    name: 'Alessandro M.',
    avatar: 'A',
    rating: 5,
    date: 'March 2024',
    title: 'Exceptional quality — exactly what was specified',
    body: 'Used across 14 ceiling runs in a luxury villa. The fit is perfect, the aluminum finish is immaculate, and the spring-clip system made installation extremely efficient. Our LED strips sit perfectly centered every time.',
    verified: true,
    project: 'Residential Villa, Tuscany',
  },
  {
    id: '2',
    name: 'Sarah O.',
    avatar: 'S',
    rating: 5,
    date: 'February 2024',
    title: 'Gold standard for trimless recessed profiles',
    body: 'After specifying dozens of lighting systems, this is the profile I reach for on every premium project. The 35mm opening is genuinely invisible at normal viewing angles. The quality of the anodizing is outstanding.',
    verified: true,
    project: 'Commercial Office, New York',
  },
  {
    id: '3',
    name: 'David L.',
    avatar: 'D',
    rating: 5,
    date: 'January 2024',
    title: 'IES files are accurate — rare in this industry',
    body: 'The photometric accuracy of the included IES files is remarkable. My AGi32 simulations matched real-world output within 3%. This level of technical rigor is rare from any LED profile manufacturer.',
    verified: true,
    project: 'Hotel Lobby, Stockholm',
  },
]

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = mockProduct
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedFinish, setSelectedFinish] = useState(product.finishes[0])
  const [selectedLength, setSelectedLength] = useState(product.lengths[0])
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'specs' | 'downloads' | 'reviews'>('specs')

  const addItem = useCartStore((s) => s.addItem)
  const toggleItem = useWishlistStore((s) => s.toggleItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const wished = isInWishlist(product.id)

  const handleAddToCart = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addItem(product as any, quantity, {
      selectedFinish: selectedFinish as any,
      selectedLength: selectedLength as any,
    })
    toast.success(`${product.name} added to cart`)
  }

  const lineTotal = selectedLength.price * quantity

  return (
    <div className="min-h-screen bg-obsidian pt-24">
      {/* Breadcrumb */}
      <div className="container-max px-6 md:px-12 py-4">
        <nav className="flex items-center gap-2 text-xs text-white/30 tracking-wide">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop/${product.category}`} className="hover:text-white transition-colors capitalize">
            {product.category.replace(/-/g, ' ')}
          </Link>
          <span>/</span>
          <span className="text-white/60">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="container-max px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          {/* Gallery */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative aspect-square bg-[#181818] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <button
                onClick={() => setSelectedImage((p) => Math.max(0, p - 1))}
                disabled={selectedImage === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 glass flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImage((p) => Math.min(product.images.length - 1, p + 1))}
                disabled={selectedImage === product.images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 glass flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.isBestseller && <span className="badge-bestseller">Bestseller</span>}
                {product.compareAtPrice && (
                  <span className="badge-sale">
                    -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => { toggleItem(product as any); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist') }}
                  className={`w-10 h-10 glass flex items-center justify-center transition-colors duration-200 ${wished ? 'text-electric' : 'text-white/50 hover:text-white'}`}
                >
                  <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
                </button>
                <button className="w-10 h-10 glass flex items-center justify-center text-white/50 hover:text-white transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative aspect-square overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === i ? 'border-electric' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-xs tracking-[0.3em] text-electric uppercase mb-3">
              {product.category.replace(/-/g, ' ')}
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-3">
              {product.name}
            </h1>
            <p className="text-white/50 leading-relaxed mb-5">{product.shortDescription}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" fill={i < Math.round(product.rating) ? '#C9A84C' : 'none'} color={i < Math.round(product.rating) ? '#C9A84C' : '#374151'} />
                ))}
              </div>
              <span className="text-sm text-white/50">{product.rating} ({product.reviewCount} reviews)</span>
              <span className="text-xs text-white/25">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-light text-white">
                {formatPrice(selectedLength.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-white/30 line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
              <span className="text-sm text-white/40">/m</span>
            </div>

            {/* Finish Selection */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs tracking-[0.2em] text-white/60 uppercase">Finish</p>
                <p className="text-xs text-white/40">— {selectedFinish.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {product.finishes.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish)}
                    title={finish.name}
                    className={`w-8 h-8 transition-all duration-200 ${
                      selectedFinish.id === finish.id ? 'ring-2 ring-electric ring-offset-2 ring-offset-obsidian' : 'ring-1 ring-white/20 hover:ring-white/40'
                    }`}
                    style={{ background: finish.color }}
                  />
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div className="mb-6">
              <p className="text-xs tracking-[0.2em] text-white/60 uppercase mb-3">Length</p>
              <div className="grid grid-cols-4 gap-2">
                {product.lengths.map((len) => (
                  <button
                    key={len.label}
                    onClick={() => setSelectedLength(len)}
                    className={`py-2.5 text-xs font-medium tracking-wide border transition-all duration-200 ${
                      selectedLength.label === len.label
                        ? 'border-electric text-white bg-electric/10'
                        : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {len.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/30 mt-2">Custom lengths available — contact us</p>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-xs tracking-[0.2em] text-white/60 uppercase mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/15">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm text-white font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-white/50">
                  Total: <span className="text-white font-medium">{formatPrice(lineTotal)}</span>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button onClick={handleAddToCart} className="btn-primary flex-1 justify-center">
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <Link href="/configurator" className="btn-secondary flex-1 justify-center">
                Configure System
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-6 border-t border-white/6">
              {[
                { icon: Truck, label: 'Free shipping over $500' },
                { icon: Shield, label: '5-year warranty' },
                { icon: RotateCcw, label: '30-day returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="w-4 h-4 text-electric" />
                  <p className="text-xs text-white/40 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* In stock indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-white/40">
                In Stock — {product.stockQuantity} units available
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-20 border-t border-white/6">
          <div className="flex items-center gap-0 border-b border-white/6">
            {(['specs', 'downloads', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-electric -mb-px'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {tab === 'specs' ? 'Specifications' : tab === 'downloads' ? 'Downloads' : `Reviews (${product.reviewCount})`}
              </button>
            ))}
          </div>

          <div className="py-10">
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/6">
                {product.specifications.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={`flex items-center justify-between px-6 py-4 border-b border-r border-white/4 ${i % 2 === 1 ? 'border-r-0' : ''}`}
                  >
                    <span className="text-xs text-white/40 tracking-wide">{spec.label}</span>
                    <span className="text-sm text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.downloads.map((dl) => (
                  <a
                    key={dl.label}
                    href={dl.url}
                    download
                    className="flex items-center gap-4 p-4 border border-white/8 hover:border-electric/30 hover:bg-white/2 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-electric/10 flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-electric" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-electric transition-colors duration-200">{dl.label}</p>
                      <p className="text-xs text-white/30">{dl.type} • {dl.size}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center gap-8 pb-8 border-b border-white/6">
                  <div className="text-center">
                    <div className="text-5xl font-light text-white mb-2">{product.rating}</div>
                    <div className="flex items-center justify-center gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4" fill="#C9A84C" color="#C9A84C" />
                      ))}
                    </div>
                    <p className="text-xs text-white/30">{product.reviewCount} reviews</p>
                  </div>
                </div>
                {mockReviews.map((review) => (
                  <div key={review.id} className="py-6 border-b border-white/5 last:border-0">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-electric/20 text-electric flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {review.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm text-white font-medium">{review.name}</span>
                          {review.verified && (
                            <span className="flex items-center gap-1 text-[10px] text-electric/70 tracking-widest uppercase">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          )}
                          <span className="text-xs text-white/25">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3" fill="#C9A84C" color="#C9A84C" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-white mb-2">{review.title}</h4>
                    <p className="text-sm text-white/50 leading-relaxed mb-2">{review.body}</p>
                    {review.project && (
                      <p className="text-xs text-electric/50 italic">Project: {review.project}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16 pt-8 border-t border-white/6">
          <h2 className="text-2xl font-light text-white mb-8 tracking-tight">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/4">
            {FEATURED_PRODUCTS.slice(1, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
