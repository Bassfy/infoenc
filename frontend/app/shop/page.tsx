'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Grid3X3, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { FEATURED_PRODUCTS, PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Product } from '@/lib/types'
import Image from 'next/image'

const ALL_PRODUCTS = [
  ...FEATURED_PRODUCTS,
  {
    id: '7', slug: 'volt-driver-100w', name: 'VOLT Driver 100W', shortDescription: 'Constant voltage driver for professional installations',
    price: 89.00, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop'],
    category: 'drivers', rating: 4.7, reviewCount: 42, isFeatured: false, isBestseller: false, isNew: false, inStock: true,
  },
  {
    id: '8', slug: 'diffuser-opal-2m', name: 'OPAL Diffuser 2m', shortDescription: 'Premium opal diffuser for soft, even light distribution',
    price: 12.50, images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80&auto=format&fit=crop'],
    category: 'diffusers', rating: 4.8, reviewCount: 78, isFeatured: false, isBestseller: true, isNew: false, inStock: true,
  },
  {
    id: '9', slug: 'flex-profile-10', name: 'FLEX Profile 10', shortDescription: 'Maximum flexibility radius profile for curved installations',
    price: 54.00, compareAtPrice: 68.00, images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop'],
    category: 'flexible', rating: 4.6, reviewCount: 29, isFeatured: false, isBestseller: false, isNew: true, inStock: true,
  },
  {
    id: '10', slug: 'smart-controller-dali', name: 'SMART Controller DALI', shortDescription: 'Professional DALI-2 controller for full smart lighting integration',
    price: 124.00, images: ['https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80&auto=format&fit=crop'],
    category: 'controllers', rating: 4.9, reviewCount: 18, isFeatured: false, isBestseller: false, isNew: true, inStock: true,
  },
]

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'bestselling', label: 'Bestselling' },
]

export default function ShopPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState('featured')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [inStockOnly, setInStockOnly] = useState(false)

  const filtered = useMemo(() => {
    let products = [...ALL_PRODUCTS] as Partial<Product>[]

    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category === selectedCategory)
    }
    if (inStockOnly) {
      products = products.filter((p) => p.inStock)
    }
    products = products.filter(
      (p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]
    )

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-desc':
        products.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case 'bestselling':
        products.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0))
        break
    }

    return products
  }, [selectedCategory, sortBy, priceRange, inStockOnly])

  return (
    <div className="min-h-screen bg-obsidian pt-24">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1920&q=80&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-obsidian/75" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-xs tracking-[0.4em] text-electric uppercase mb-3">Our Collection</p>
          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            LED Profiles & Lighting
          </h1>
          <p className="text-white/40 mt-3 text-sm">
            {ALL_PRODUCTS.length} premium architectural lighting products
          </p>
        </div>
      </div>

      <div className="container-max px-6 md:px-12 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Category pills (scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-shrink-0 px-4 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-electric text-obsidian'
                  : 'border border-white/15 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              All
            </button>
            {PRODUCT_CATEGORIES.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 text-xs tracking-widest uppercase transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-electric text-obsidian'
                    : 'border border-white/15 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#181818] border border-white/10 px-4 py-2 pr-8 text-xs text-white/60 tracking-widest uppercase outline-none cursor-pointer hover:border-white/20 transition-colors duration-200"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#181818]">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 border text-xs tracking-widest uppercase transition-all duration-200 ${
                filtersOpen
                  ? 'border-electric text-electric'
                  : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            {/* View toggle */}
            <div className="flex items-center border border-white/10">
              <button
                onClick={() => setView('grid')}
                className={`p-2.5 transition-colors duration-200 ${view === 'grid' ? 'text-white bg-white/8' : 'text-white/30 hover:text-white'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2.5 transition-colors duration-200 ${view === 'list' ? 'text-white bg-white/8' : 'text-white/30 hover:text-white'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 bg-[#181818] border border-white/8 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div>
              <h4 className="text-xs tracking-[0.25em] text-white uppercase mb-4">Price Range</h4>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-full input-field text-xs py-2"
                  placeholder="Min"
                />
                <span className="text-white/30">—</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full input-field text-xs py-2"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <h4 className="text-xs tracking-[0.25em] text-white uppercase mb-4">Availability</h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`w-10 h-5 relative transition-colors duration-200 cursor-pointer ${inStockOnly ? 'bg-electric' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-200 ${inStockOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-white/60">In Stock Only</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSelectedCategory('all'); setSortBy('featured'); setPriceRange([0, 500]); setInStockOnly(false) }}
                className="text-xs text-white/40 hover:text-white tracking-widest uppercase flex items-center gap-1.5 transition-colors duration-200"
              >
                <X className="w-3 h-3" /> Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Results count */}
        <p className="text-xs text-white/30 tracking-widest mb-6">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          {selectedCategory !== 'all' && ` in ${PRODUCT_CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
        </p>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-white/30 text-lg mb-4">No products found</p>
            <button
              onClick={() => { setSelectedCategory('all'); setPriceRange([0, 500]) }}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/4">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ProductCard product={product} view="grid" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-px bg-white/4">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <ProductCard product={product} view="list" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
