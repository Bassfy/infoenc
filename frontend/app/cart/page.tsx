'use client';

import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, Heart, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, getTotal, couponCode, discount, applyCoupon, removeCoupon } = useCartStore();
  const { addItem: addToWishlist } = useWishlistStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();
  const shippingCost = subtotal >= 500 ? 0 : 29.90;
  const taxAmount = total * 0.08;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim().toUpperCase(), orderAmount: subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(couponInput.trim().toUpperCase(), data.data.discountAmount);
        toast.success(`Coupon applied — ${formatPrice(data.data.discountAmount)} saved`);
        setCouponInput('');
      } else {
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-obsidian pt-32 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-obsidian-200 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-obsidian-500" />
          </div>
          <h1 className="text-3xl font-display font-light text-white mb-3">Your cart is empty</h1>
          <p className="text-obsidian-500 mb-8">Add some products to get started</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-display font-light text-white">Shopping Cart</h1>
          <p className="text-obsidian-500 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-obsidian-100 border border-obsidian-300 rounded-2xl p-5 flex gap-5"
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-obsidian-200">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${item.slug}`} className="text-white font-medium hover:text-electric transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    {item.selectedFinish && (
                      <p className="text-obsidian-500 text-sm mt-0.5">Finish: {item.selectedFinish}</p>
                    )}
                    {item.selectedLength && (
                      <p className="text-obsidian-500 text-sm">Length: {item.selectedLength}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 bg-obsidian-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-obsidian-500 hover:text-white hover:bg-obsidian-300 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-white text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-obsidian-500 hover:text-white hover:bg-obsidian-300 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => {
                        addToWishlist({ id: item.id, slug: item.slug, name: item.name, price: item.price, image: item.image });
                        removeItem(item.id);
                        toast.success('Moved to wishlist');
                      }}
                      className="p-1.5 text-obsidian-500 hover:text-electric transition-colors"
                      title="Save for later"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { removeItem(item.id); toast.success('Item removed'); }}
                      className="p-1.5 text-obsidian-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <div className="pt-2">
              <Link href="/shop" className="inline-flex items-center gap-2 text-electric hover:text-electric-400 transition-colors text-sm">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-obsidian-100 border border-obsidian-300 rounded-2xl p-6 h-fit sticky top-24"
          >
            <h2 className="text-xl font-display font-light text-white mb-6">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              {couponCode ? (
                <div className="flex items-center justify-between bg-electric/10 border border-electric/30 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-electric" />
                    <span className="text-electric text-sm font-medium">{couponCode}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-obsidian-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="input-field flex-1 text-sm py-2.5"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-obsidian-200 hover:bg-obsidian-300 text-white text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-obsidian-400">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-electric">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-obsidian-400">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'text-electric' : 'text-white'}>
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-obsidian-400">
                <span>Est. Tax (8%)</span>
                <span className="text-white">{formatPrice(taxAmount)}</span>
              </div>

              <div className="border-t border-obsidian-300 pt-3 flex justify-between text-white font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(total + shippingCost + taxAmount)}</span>
              </div>
            </div>

            {subtotal < 500 && (
              <p className="text-xs text-obsidian-500 mt-3 text-center">
                Add {formatPrice(500 - subtotal)} more for free shipping
              </p>
            )}

            <Link
              href="/checkout"
              className="btn-primary w-full text-center mt-6 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-obsidian-500">
              <span>SSL Secured</span>
              <span>·</span>
              <span>30-Day Returns</span>
              <span>·</span>
              <span>5yr Warranty</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
