"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { RevealText } from "@/components/UI/AnimatedText";
import { GlassCard } from "@/components/UI/GlassCard";
import { COLLECTIONS } from "@/lib/data";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FILTERS = [
  { value: "all", label: "All Collections" },
  { value: "interior", label: "Interior" },
  { value: "exterior", label: "Exterior" },
  { value: "commercial", label: "Commercial" },
  { value: "smart", label: "Smart" },
];

export function CollectionGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredCollections = COLLECTIONS.filter((c) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "exterior") return ["landscape", "outdoor"].includes(c.category);
    if (activeFilter === "commercial") return c.category === "commercial";
    if (activeFilter === "smart") return c.category === "smart";
    return ["interior", "recessed", "track", "pendant", "wall", "surface"].includes(c.category);
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".collection-item", {
        opacity: 0,
        y: 60,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-section bg-gray-50 overflow-hidden"
      id="collections"
    >
      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/20 to-transparent" />

      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <RevealText>
              <div className="section-label mb-4">Collections</div>
            </RevealText>
            <RevealText delay={0.1}>
              <h2 className="font-heading font-bold text-display-lg text-gray-900">
                Curated for Every
                <br />
                <span className="text-gradient-gold">Vision</span>
              </h2>
            </RevealText>
          </div>

          {/* Filters */}
          <RevealText direction="left" delay={0.2}>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <motion.button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`relative px-5 py-2.5 text-xs font-heading uppercase tracking-wider rounded-full transition-all duration-300 overflow-hidden ${
                    activeFilter === filter.value
                      ? "text-obsidian-DEFAULT font-semibold"
                      : "glass-panel text-gray-500 hover:text-gray-900 border border-gray-200"
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {activeFilter === filter.value && (
                    <motion.span
                      className="absolute inset-0 bg-gold-gradient"
                      layoutId="active-filter"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{filter.label}</span>
                </motion.button>
              ))}
            </div>
          </RevealText>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                className="collection-item"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setHoveredId(collection.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={`/collections/${collection.id}`} className="block group">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-obsidian-950">
                    <Image
                      src={collection.coverImage}
                      alt={collection.name}
                      fill
                      className={`object-cover transition-transform duration-700 ${
                        hoveredId === collection.id ? "scale-110" : "scale-100"
                      }`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 ${
                      hoveredId === collection.id ? "opacity-100" : "opacity-80"
                    }`} />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                      {collection.isNew && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold-DEFAULT text-black text-[10px] font-heading font-bold uppercase tracking-wider">
                          <Sparkles size={9} />
                          New
                        </span>
                      )}
                      {collection.isFeatured && (
                        <span className="px-3 py-1 rounded-full glass-panel-dark text-gold-DEFAULT text-[10px] font-heading uppercase tracking-wider border border-gold-DEFAULT/20">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] font-heading uppercase tracking-[0.3em] text-gold-DEFAULT mb-2">
                            {collection.productCount} Products
                          </div>
                          <h3 className="font-heading font-bold text-xl text-white mb-2">
                            {collection.name}
                          </h3>
                          <p className={`text-sm text-white/60 max-w-[280px] leading-relaxed transition-all duration-500 overflow-hidden ${
                            hoveredId === collection.id ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                          }`}>
                            {collection.description}
                          </p>
                        </div>

                        <motion.div
                          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white shrink-0"
                          animate={{
                            backgroundColor: hoveredId === collection.id ? "rgba(201,168,76,1)" : "transparent",
                            borderColor: hoveredId === collection.id ? "rgba(201,168,76,1)" : "rgba(255,255,255,0.2)",
                            color: hoveredId === collection.id ? "#000" : "#fff",
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <ArrowRight size={14} />
                        </motion.div>
                      </div>

                      {/* Tags */}
                      <div className={`flex flex-wrap gap-1.5 mt-4 transition-all duration-500 overflow-hidden ${
                        hoveredId === collection.id ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
                      }`}>
                        {collection.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full text-[10px] font-heading uppercase tracking-wider bg-white/10 text-white/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View all */}
        <div className="text-center mt-12">
          <Link href="/collections" className="btn-outline text-xs inline-flex items-center gap-3">
            Browse All Collections
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
