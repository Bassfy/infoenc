'use client';

import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart, openCart } = useCartStore();

  function handleAddToCart(item: typeof items[0]) {
    addToCart({
      id: item.id,
      slug: item.slug,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    openCart();
    toast.success('Added to cart');
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
            <Heart className="w-10 h-10 text-obsidian-500" />
          </div>
          <h1 className="text-3xl font-display font-light text-white mb-3">Your wishlist is empty</h1>
          <p className="text-obsidian-500 mb-8">Save products you love for later</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            Explore Products <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-4xl font-display font-light text-white">Wishlist</h1>
            <p className="text-obsidian-500 mt-1">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => { clearWishlist(); toast.success('Wishlist cleared'); }}
              className="text-sm text-obsidian-500 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="bg-obsidian-100 border border-obsidian-300 rounded-2xl overflow-hidden group"
              >
                {/* Image */}
                <Link href={`/shop/${item.slug}`} className="block relative aspect-square bg-obsidian-200">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.id);
                      toast.success('Removed from wishlist');
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link href={`/shop/${item.slug}`} className="text-white font-medium hover:text-electric transition-colors line-clamp-2 text-sm">
                    {item.name}
                  </Link>
                  <p className="text-electric font-semibold mt-2">{formatPrice(item.price)}</p>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-electric text-obsidian font-medium text-sm hover:bg-electric-600 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
