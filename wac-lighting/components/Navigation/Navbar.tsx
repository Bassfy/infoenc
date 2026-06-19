"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { NAV_ITEMS } from "@/lib/data";
import { Search, Menu, X, Phone } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      setHidden(currentScrollY > lastScrollY.current && currentScrollY > 200);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuEnter = useCallback((label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  }, []);

  const handleMenuLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  }, []);

  const activeItem = NAV_ITEMS.find((item) => item.label === activeMenu);

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "glass-panel-dark border-b border-white/[0.05]" : "bg-transparent"
        )}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group z-10" aria-label="WAC Lighting Home">
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="20" cy="20" r="19" stroke="#C9A84C" strokeWidth="1.5" />
                  <path d="M20 8 L28 24 H12 Z" fill="#C9A84C" opacity="0.9" />
                  <circle cx="20" cy="11" r="2" fill="#E4C76B" />
                  <path d="M16 27 Q20 24 24 27" stroke="#C9A84C" strokeWidth="1" fill="none" />
                  <path d="M14 30 Q20 26 26 30" stroke="#C9A84C" strokeWidth="0.8" fill="none" opacity="0.6" />
                </svg>
                <div className="absolute inset-0 rounded-full bg-gold-DEFAULT/10 blur-lg group-hover:bg-gold-DEFAULT/20 transition-all duration-500" />
              </div>
              <div>
                <div className="font-heading font-bold text-white text-lg tracking-[0.15em] uppercase leading-none group-hover:text-gold-light transition-colors duration-300">
                  WAC
                </div>
                <div className="font-heading text-[9px] tracking-[0.4em] uppercase text-gold-DEFAULT/70 leading-none mt-0.5">
                  Lighting
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.megaMenu ? handleMenuEnter(item.label) : undefined}
                  onMouseLeave={item.megaMenu ? handleMenuLeave : undefined}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 font-heading text-sm font-medium tracking-wider uppercase transition-colors duration-300 flex items-center gap-1",
                      activeMenu === item.label ? "text-gold-DEFAULT" : "text-white/70 hover:text-white"
                    )}
                    aria-expanded={item.megaMenu ? activeMenu === item.label : undefined}
                  >
                    {item.label}
                    {item.megaMenu && (
                      <motion.svg
                        viewBox="0 0 12 8"
                        fill="none"
                        className="w-2.5 h-2 opacity-50"
                        animate={{ rotate: activeMenu === item.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </motion.svg>
                    )}
                    <motion.span
                      className="absolute bottom-0 left-4 right-4 h-px bg-gold-DEFAULT origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: activeMenu === item.label ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex items-center justify-center w-10 h-10 text-white/60 hover:text-gold-DEFAULT transition-colors duration-300"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link
                href="/contact"
                className="hidden md:flex items-center gap-2 text-xs font-heading font-medium uppercase tracking-wider text-white/60 hover:text-gold-DEFAULT transition-colors duration-300"
              >
                <Phone size={14} />
                <span>800-526-2588</span>
              </Link>

              <Link
                href="/contact"
                className="hidden lg:inline-flex btn-primary text-xs py-3 px-6"
              >
                Get Specification
              </Link>

              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 text-white/70 hover:text-white transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Gold accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/50 to-transparent w-full"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: scrolled ? 1 : 0, opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      </motion.header>

      {/* Mega Menu */}
      <AnimatePresence>
        {activeMenu && activeItem?.megaMenu && (
          <div
            onMouseEnter={() => handleMenuEnter(activeMenu)}
            onMouseLeave={handleMenuLeave}
          >
            <MegaMenu
              columns={activeItem.megaMenu.columns}
              isOpen={true}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-start justify-center pt-32 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-2xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center gap-4 glass-panel rounded-xl px-6 py-4 border border-gold-DEFAULT/20">
                <Search size={20} className="text-gold-DEFAULT shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, collections, technology..."
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-white/30 font-heading"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-4 flex gap-3 flex-wrap">
                {["Track Lighting", "Smart Systems", "Recessed LED", "Landscape", "Pendants"].map((tag) => (
                  <button
                    key={tag}
                    className="text-xs font-heading uppercase tracking-wider px-4 py-2 rounded-full border border-white/10 text-white/50 hover:border-gold-DEFAULT/50 hover:text-gold-light transition-all duration-300"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
