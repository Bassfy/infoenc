'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, ShoppingBag, Star } from 'lucide-react'
import { FEATURED_PRODUCTS } from '@/lib/constants'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import type { Product } from '@/lib/types'
import toast from 'react-hot-toast'

function ProductCard({ product, index }: { product: Partial<Product>; index: number }) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleItem = useWishlistStore((s) => s.toggleItem)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const wished = isInWishlist(product.id || '')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
      className="card-product group"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.images?.[0] || ''}
          alt={product.name || ''}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-expo-out group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNew && <span className="badge-new">New</span>}
          {product.isBestseller && <span className="badge-bestseller">Bestseller</span>}
          {product.compareAtPrice && (
            <span className="badge-sale">
              -{getDiscountPercentage(product.price!, product.compareAtPrice)}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={() => {
              toggleItem(product as Product)
              toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
            }}
            className={`w-9 h-9 glass flex items-center justify-center transition-colors duration-200 ${wished ? 'text-electric' : 'text-white/60 hover:text-white'}`}
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => {
              addItem(product as Product)
              toast.success(`${product.name} added to cart`)
            }}
            className="w-9 h-9 glass flex items-center justify-center text-white/60 hover:text-white transition-colors duration-200"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Quick view on bottom */}
        <div className="absolute inset-x-0 bottom-0 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link
            href={`/shop/${product.slug}`}
            className="block w-full bg-electric/95 backdrop-blur-sm py-3 text-center text-xs tracking-[0.2em] text-obsidian font-semibold uppercase hover:bg-electric transition-colors duration-200"
          >
            View Product
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-[10px] tracking-[0.25em] text-white/30 uppercase mb-2 capitalize">
          {product.category?.replace('-', ' ')}
        </p>
        <h3 className="text-base font-light text-white mb-3 tracking-wide">
          <Link href={`/shop/${product.slug}`} className="hover:text-electric transition-colors duration-200">
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3"
                fill={i < Math.round(product.rating || 0) ? '#C9A84C' : 'none'}
                color={i < Math.round(product.rating || 0) ? '#C9A84C' : '#4B5563'}
              />
            ))}
          </div>
          <span className="text-xs text-white/30">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-light text-white">
            {formatPrice(product.price || 0)}
            <span className="text-xs text-white/30 ml-1">/m</span>
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-white/30 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedProducts() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section-padding bg-obsidian">
      <div className="container-max">
        {/* Header */}
        <div ref={ref} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="section-subtitle mb-4"
            >
              Curated Selection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="section-title"
            >
              Featured
              <br />
              <span className="text-white/30">Products</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white tracking-widest uppercase transition-colors duration-300"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-white/4">
          {FEATURED_PRODUCTS.map((product, index) => (
            <div key={product.id} className={index < 2 ? 'xl:col-span-2' : 'xl:col-span-2'}>
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14"
        >
          <Link href="/shop" className="btn-primary">
            Browse Full Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/configurator" className="btn-secondary">
            Custom Configuration
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
