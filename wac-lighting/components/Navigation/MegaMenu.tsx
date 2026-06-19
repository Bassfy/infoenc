"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface MegaMenuColumn {
  title: string;
  items: { label: string; href: string }[];
}

interface MegaMenuProps {
  columns: MegaMenuColumn[];
  isOpen: boolean;
}

export function MegaMenu({ columns, isOpen }: MegaMenuProps) {
  return (
    <motion.div
      className="fixed top-20 md:top-24 left-0 right-0 z-40"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="glass-panel-dark border-b border-white/[0.06] shadow-2xl">
        <div className="container-wide py-10">
          <div className="grid grid-cols-5 gap-8">
            {/* Columns */}
            <div className="col-span-4 grid grid-cols-4 gap-8">
              {columns.map((column, colIndex) => (
                <motion.div
                  key={column.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIndex * 0.05, duration: 0.3 }}
                >
                  <h3 className="text-[10px] font-heading uppercase tracking-[0.3em] text-gold-DEFAULT mb-4">
                    {column.title}
                  </h3>
                  <ul className="space-y-2">
                    {column.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          className="group flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200 py-1"
                        >
                          <span className="w-0 group-hover:w-3 transition-all duration-200 overflow-hidden">
                            <ArrowRight size={10} className="text-gold-DEFAULT" />
                          </span>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Featured panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="col-span-1"
            >
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gold-DEFAULT/10 to-transparent border border-gold-DEFAULT/20 p-5 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-DEFAULT/5 rounded-full blur-2xl" />
                <Sparkles size={16} className="text-gold-DEFAULT mb-3" />
                <h4 className="font-heading font-semibold text-white text-sm mb-2">
                  New: Aurora Series
                </h4>
                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Cinematic pendant luminaires inspired by atmospheric light phenomena.
                </p>
                <Link
                  href="/collections/aurora"
                  className="inline-flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-gold-DEFAULT hover:text-gold-light transition-colors duration-200"
                >
                  Explore Now
                  <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Bottom links */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-8">
            {[
              "New Arrivals",
              "Best Sellers",
              "Energy Star Certified",
              "Smart Home Compatible",
              "View All Products",
            ].map((label, i) => (
              <Link
                key={label}
                href={`/products/${label.toLowerCase().replace(/ /g, "-")}`}
                className={`text-xs font-heading uppercase tracking-wider transition-colors duration-200 ${
                  i === 4
                    ? "text-gold-DEFAULT hover:text-gold-light ml-auto"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {i === 4 ? (
                  <span className="flex items-center gap-2">
                    {label} <ArrowRight size={12} />
                  </span>
                ) : label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
