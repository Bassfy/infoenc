"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, ChevronRight, Phone, Mail } from "lucide-react";
import { NAV_ITEMS } from "@/lib/data";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-sm glass-panel-dark border-l border-white/[0.06] overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <div className="font-heading font-bold text-white text-lg tracking-[0.15em] uppercase">
                WAC <span className="text-gold-DEFAULT">Lighting</span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="p-6 space-y-1">
              {NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.megaMenu ? (
                    <div>
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between py-3.5 px-4 text-white/70 hover:text-white font-heading font-medium uppercase tracking-wider text-sm rounded-lg hover:bg-white/5 transition-all duration-200"
                      >
                        {item.label}
                        <motion.div
                          animate={{ rotate: expandedItem === item.label ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight size={16} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedItem === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pb-2 space-y-1">
                              {item.megaMenu.columns.map((col) => (
                                <div key={col.title} className="mb-4">
                                  <div className="text-[10px] font-heading uppercase tracking-[0.3em] text-gold-DEFAULT px-4 py-2">
                                    {col.title}
                                  </div>
                                  {col.items.map((subItem) => (
                                    <Link
                                      key={subItem.label}
                                      href={subItem.href}
                                      onClick={onClose}
                                      className="block px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                                    >
                                      {subItem.label}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between py-3.5 px-4 text-white/70 hover:text-white font-heading font-medium uppercase tracking-wider text-sm rounded-lg hover:bg-white/5 transition-all duration-200"
                    >
                      {item.label}
                      <ChevronRight size={16} className="opacity-30" />
                    </Link>
                  )}
                </motion.div>
              ))}
            </nav>

            <div className="p-6 border-t border-white/[0.06] space-y-4 mt-4">
              <Link
                href="/contact"
                onClick={onClose}
                className="w-full btn-primary justify-center text-center text-xs"
              >
                Get Specification
              </Link>

              <div className="space-y-3">
                <a
                  href="tel:+18005262588"
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <Phone size={14} className="text-gold-DEFAULT" />
                  800-526-2588
                </a>
                <a
                  href="mailto:info@waclighting.com"
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <Mail size={14} className="text-gold-DEFAULT" />
                  info@waclighting.com
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
