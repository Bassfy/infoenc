'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Eye, Star, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import type { Product } from '@/lib/types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Partial<Product>
  view?: 'grid' | 'list'
}

export default function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const toggleItem = useWishlistStore((s) => s.toggleItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const wished = isInWishlist(product.id || '')

  if (view === 'list') {
    return (
      <div className="flex gap-6 p-6 bg-[#181818] border border-white/5 hover:border-white/10 transition-all duration-300 group">
        <Link href={`/shop/${product.slug}`} className="relative w-48 aspect-square flex-shrink-0 overflow-hidden">
          <Image
            src={product.images?.[0] || ''}
            alt={product.name || ''}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-white/30 uppercase mb-1 capitalize">
                  {product.category?.replace(/-/g, ' ')}
                </p>
                <h3 className="text-lg font-light text-white">
                  <Link href={`/shop/${product.slug}`} className="hover:text-electric transition-colors">
                    {product.name}
                  </Link>
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {product.isNew && <span className="badge-new">New</span>}
                {product.isBestseller && <span className="badge-bestseller">Bestseller</span>}
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-4 max-w-md">
              {product.shortDescription}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    fill={i < Math.round(product.rating || 0) ? '#C9A84C' : 'none'}
                    color={i < Math.round(product.rating || 0) ? '#C9A84C' : '#374151'}
                  />
                ))}
              </div>
              <span className="text-xs text-white/30">({product.reviewCount} reviews)</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-light text-white">
                {formatPrice(product.price || 0)}
                <span className="text-sm text-white/30 ml-1">/m</span>
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-white/30 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { toggleItem(product as Product); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist') }}
                className={`w-10 h-10 border flex items-center justify-center transition-all duration-200 ${wished ? 'border-electric text-electric' : 'border-white/15 text-white/40 hover:border-white/30 hover:text-white'}`}
              >
                <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => { addItem(product as Product); toast.success(`${product.name} added to cart`) }}
                className="btn-primary px-5 py-2.5 text-xs"
              >
                Add to Cart
              </button>
              <Link href={`/shop/${product.slug}`} className="btn-secondary px-4 py-2.5 text-xs">
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-product group">
      {/* Image Container */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        onMouseEnter={() => product.images?.[1] && setImgIndex(1)}
        onMouseLeave={() => setImgIndex(0)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={imgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={product.images?.[imgIndex] || product.images?.[0] || ''}
              alt={product.name || ''}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && <span className="badge-new">New</span>}
          {product.isBestseller && <span className="badge-bestseller">Bestseller</span>}
          {product.compareAtPrice && (
            <span className="badge-sale">
              -{getDiscountPercentage(product.price!, product.compareAtPrice)}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={() => { toggleItem(product as Product); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist') }}
            className={`w-8 h-8 glass flex items-center justify-center transition-colors duration-200 ${wished ? 'text-electric' : 'text-white/60 hover:text-white'}`}
          >
            <Heart className="w-3.5 h-3.5" fill={wished ? 'currentColor' : 'none'} />
          </button>
          <Link href={`/shop/${product.slug}`} className="w-8 h-8 glass flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200">
            <Eye className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => { addItem(product as Product); toast.success(`${product.name} added to cart`) }}
            className="w-8 h-8 glass flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Shop */}
        <div className="absolute inset-x-0 bottom-0 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => { addItem(product as Product); toast.success(`${product.name} added to cart`) }}
            className="w-full bg-electric/95 py-2.5 text-center text-[10px] tracking-[0.2em] text-obsidian font-bold uppercase hover:bg-electric transition-colors duration-200"
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-[10px] tracking-[0.25em] text-white/25 uppercase mb-1.5 capitalize">
          {product.category?.replace(/-/g, ' ')}
        </p>
        <h3 className="text-sm font-medium text-white mb-3 tracking-wide leading-snug">
          <Link href={`/shop/${product.slug}`} className="hover:text-electric transition-colors duration-200">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-2.5 h-2.5"
                fill={i < Math.round(product.rating || 0) ? '#C9A84C' : 'none'}
                color={i < Math.round(product.rating || 0) ? '#C9A84C' : '#374151'}
              />
            ))}
          </div>
          <span className="text-[10px] text-white/25">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-light text-white">
            {formatPrice(product.price || 0)}
            <span className="text-xs text-white/25 ml-1">/m</span>
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-white/25 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
