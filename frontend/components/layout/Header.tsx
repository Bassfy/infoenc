'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Heart, Menu, X, ChevronDown, Globe } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { NAVIGATION, SITE_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const headerRef = useRef<HTMLElement>(null)
  const cartCount = useCartStore((s) => s.getItemCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null)
        setSearchOpen(false)
        setMobileOpen(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
  }, [mobileOpen])

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-obsidian/95 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        )}
      >
        <div className="container-max px-6 md:px-12">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group" onClick={() => setActiveMenu(null)}>
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 border border-electric/60 rotate-45 transition-transform duration-500 group-hover:rotate-90" />
                  <div className="absolute inset-1.5 bg-electric/20 rotate-45 transition-all duration-500 group-hover:bg-electric/40" />
                </div>
                <div>
                  <span className="text-white font-light tracking-[0.15em] text-sm uppercase block leading-none">
                    LED Profile
                  </span>
                  <span className="text-electric text-xs tracking-[0.3em] uppercase font-medium">
                    Decorations
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAVIGATION.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveMenu(item.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'nav-link flex items-center gap-1',
                      activeMenu === item.label && 'text-white'
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 transition-transform duration-300',
                          activeMenu === item.label && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {item.children && activeMenu === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50"
                        style={{ width: item.label === 'Products' ? '680px' : '480px' }}
                      >
                        <div className="glass border border-white/8 p-6 shadow-2xl">
                          <div
                            className={cn(
                              'grid gap-1',
                              item.label === 'Products' ? 'grid-cols-3' : 'grid-cols-2'
                            )}
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setActiveMenu(null)}
                                className="group p-3 hover:bg-white/4 transition-colors duration-200"
                              >
                                <span className="block text-sm text-white/90 font-medium group-hover:text-electric transition-colors duration-200">
                                  {child.label}
                                </span>
                                {child.description && (
                                  <span className="block text-xs text-white/40 mt-0.5 leading-relaxed">
                                    {child.description}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/6">
                            <Link
                              href={item.href}
                              onClick={() => setActiveMenu(null)}
                              className="text-xs text-electric tracking-widest uppercase hover:text-white transition-colors duration-200"
                            >
                              View All {item.label} →
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-3 text-white/50 hover:text-white transition-colors duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language */}
              <button className="hidden md:flex p-3 text-white/50 hover:text-white transition-colors duration-200">
                <Globe className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-3 text-white/50 hover:text-white transition-colors duration-200"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <motion.span
                    key={wishlistCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-2 right-2 w-4 h-4 bg-electric text-obsidian text-[9px] font-bold flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-3 text-white/50 hover:text-white transition-colors duration-200"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-2 right-2 w-4 h-4 bg-electric text-obsidian text-[9px] font-bold flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-3 text-white/60 hover:text-white transition-colors duration-200"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-obsidian/96 backdrop-blur-xl flex items-start justify-center pt-32 px-6"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="w-full max-w-2xl"
            >
              <div className="relative border-b border-white/20 pb-0">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search profiles, strips, accessories..."
                  className="w-full bg-transparent pl-8 pr-12 py-4 text-xl text-white placeholder-white/20 outline-none tracking-wide"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-6 text-xs text-white/25 tracking-widest uppercase">
                Popular searches: LED Profiles, COB Strips, Recessed, Power Supply
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 z-[55] w-full max-w-sm glass-dark border-l border-white/6 overflow-y-auto"
          >
            <div className="flex flex-col p-8 pt-28 gap-2">
              {NAVIGATION.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-xl font-light text-white/70 hover:text-white border-b border-white/5 tracking-wide transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 pt-6 border-t border-white/6"
              >
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Get a Quote
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
