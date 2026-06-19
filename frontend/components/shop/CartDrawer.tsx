'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
    couponCode,
    discount,
  } = useCartStore()

  const subtotal = getSubtotal()
  const total = getTotal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-obsidian/60 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 z-[75] w-full max-w-md glass-dark border-l border-white/6 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-electric" />
                <h2 className="text-sm font-medium tracking-widest uppercase text-white">
                  Shopping Cart
                </h2>
                {items.length > 0 && (
                  <span className="w-5 h-5 bg-electric text-obsidian text-[10px] font-bold flex items-center justify-center">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-white/40 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-6 scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                  <div className="w-16 h-16 border border-white/10 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <p className="text-white/60 mb-1">Your cart is empty</p>
                    <p className="text-sm text-white/30">Explore our premium LED profiles</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="btn-primary mt-2"
                  >
                    Start Shopping
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 py-4 border-b border-white/5 last:border-0"
                    >
                      {/* Image */}
                      <Link
                        href={`/shop/${item.product.slug}`}
                        onClick={closeCart}
                        className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-[#181818]"
                      >
                        <Image
                          src={item.product.images?.[0] || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm text-white hover:text-electric transition-colors duration-200 block mb-1 leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-white/30 mb-1 capitalize">
                          {item.product.category?.replace(/-/g, ' ')}
                        </p>
                        {item.selectedLength && (
                          <p className="text-xs text-white/30">
                            {item.selectedLength.label}
                          </p>
                        )}
                        {item.selectedFinish && (
                          <p className="text-xs text-white/30">{item.selectedFinish.name}</p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity */}
                          <div className="flex items-center border border-white/10">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white transition-colors duration-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price + Remove */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-white">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-white/20 hover:text-red-400 transition-colors duration-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/6 p-6 space-y-4">
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {couponCode && discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-electric">Discount ({couponCode})</span>
                      <span className="text-electric">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Shipping</span>
                    <span className="text-white/50">
                      {subtotal >= 500 ? 'Free' : 'Calculated at checkout'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/8">
                    <span className="text-sm font-medium text-white uppercase tracking-widest">Total</span>
                    <span className="text-lg font-light text-white">{formatPrice(total)}</span>
                  </div>
                </div>

                {subtotal < 500 && (
                  <p className="text-xs text-white/30 text-center">
                    Add {formatPrice(500 - subtotal)} more for free shipping
                  </p>
                )}

                <div className="space-y-2">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="btn-primary w-full justify-center"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="btn-secondary w-full justify-center text-xs py-3"
                  >
                    View Full Cart
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
