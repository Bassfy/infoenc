"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, RotateCcw, ZoomIn, Maximize2 } from "lucide-react";
import { RevealText } from "@/components/UI/AnimatedText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ProductShowcaseScene = dynamic(
  () => import("@/components/Scenes/ProductScene").then((m) => ({ default: m.ProductShowcaseScene })),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border border-gold-DEFAULT/30 border-t-gold-DEFAULT animate-spin" />
    </div>
  )}
);

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    id: "meridian-ar",
    name: "Meridian AR/JR Track Head",
    category: "Track Lighting",
    spec: "10W · 1000lm · CRI 95+ · 2700–5000K",
    description: "Precision-engineered track head with patented SmartDriver™ technology. Individually calibrated beam optics deliver ±1° accuracy.",
    features: ["Field-rotatable optics", "SmartLink compatible", "CEC Title 24", "Dimmable 1–100%"],
    finish: ["Brushed Nickel", "Matte Black", "Bronze"],
    price: "From $189",
    isNew: true,
  },
  {
    id: "essence-d",
    name: "Essence D Recessed Downlight",
    category: "Recessed Lighting",
    spec: "8W · 750lm · CRI 97+ · Tunable White",
    description: "Ultra-thin 1.25\" profile recessed downlight with TrueColor phosphor array. Zero compromise between aesthetics and performance.",
    features: ["1.25\" aperture", "TrueColor technology", "Wet location rated", "IBEW union-made"],
    finish: ["White", "Black", "Gold"],
    price: "From $145",
    isNew: false,
  },
  {
    id: "terra-in",
    name: "Terra In-Ground Uplight",
    category: "Landscape",
    spec: "15W · 1500lm · CRI 90+ · IP67",
    description: "Military-spec sealed in-ground uplight rated for full submersion. Stainless housing with aircraft-grade PMMA lens.",
    features: ["IP67 submersion rated", "316 stainless housing", "Asymmetric optics", "Smart color"],
    finish: ["Stainless", "Bronze", "Dark Sky"],
    price: "From $295",
    isNew: false,
  },
];

export function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeProduct, setActiveProduct] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".product-panel", {
        x: 60,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const product = PRODUCTS[activeProduct];

  return (
    <section
      ref={sectionRef}
      className="relative py-section bg-white overflow-hidden"
      id="products"
    >
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold-DEFAULT/[0.05] blur-3xl pointer-events-none" />

      <div className="container-wide">
        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <RevealText>
              <div className="section-label mb-4">Interactive Product Experience</div>
            </RevealText>
            <RevealText delay={0.1}>
              <h2 className="font-heading font-bold text-display-lg text-gray-900">
                Engineered for
                <br />
                <span className="text-gradient-gold">Perfection</span>
              </h2>
            </RevealText>
          </div>
          <RevealText direction="left" delay={0.2} className="hidden md:block">
            <Link
              href="/products"
              className="btn-outline flex items-center gap-2 text-xs"
            >
              View All Products
              <ArrowRight size={14} />
            </Link>
          </RevealText>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[700px]">
          {/* 3D Viewer */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Canvas container */}
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                <ProductShowcaseScene />
              </div>

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {[
                  { icon: RotateCcw, label: "Auto Rotate" },
                  { icon: ZoomIn, label: "Zoom" },
                  { icon: Maximize2, label: "Fullscreen" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="w-9 h-9 glass-panel rounded-lg flex items-center justify-center text-gray-400 hover:text-gold-DEFAULT transition-colors duration-200"
                    aria-label={label}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 80px rgba(201,168,76,0.05)",
                }}
              />

              {/* Corner accents */}
              {[
                "top-3 left-3 border-t border-l",
                "top-3 right-3 border-t border-r",
                "bottom-3 left-3 border-b border-l",
                "bottom-3 right-3 border-b border-r",
              ].map((classes, i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 border-gold-DEFAULT/40 ${classes}`}
                />
              ))}
            </div>

            {/* Drag hint */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400 font-heading uppercase tracking-widest">
                Drag to rotate · Scroll to zoom
              </p>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-panel space-y-8">
            {/* Product selector tabs */}
            <div className="flex gap-2 flex-wrap">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setActiveProduct(i); setSelectedFinish(0); }}
                  className={`relative px-4 py-2 text-xs font-heading uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeProduct === i
                      ? "bg-gold-DEFAULT text-obsidian-DEFAULT font-semibold"
                      : "glass-panel text-gray-500 hover:text-gray-900 border border-gray-200"
                  }`}
                >
                  {p.category}
                  {p.isNew && (
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] font-heading uppercase tracking-wider bg-gold-DEFAULT text-black px-1.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Product name */}
                <h3 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">
                  {product.name}
                </h3>
                <div className="text-xs font-heading uppercase tracking-[0.2em] text-gold-DEFAULT mb-4">
                  {product.spec}
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {product.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1 h-1 rounded-full bg-gold-DEFAULT shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* Finish selector */}
                <div className="mb-8">
                  <div className="text-xs font-heading uppercase tracking-[0.2em] text-gray-400 mb-3">
                    Finish: <span className="text-gray-700">{product.finish[selectedFinish]}</span>
                  </div>
                  <div className="flex gap-3">
                    {product.finish.map((f, i) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFinish(i)}
                        className={`px-4 py-2 text-xs font-heading uppercase tracking-wider rounded-full border transition-all duration-200 ${
                          selectedFinish === i
                            ? "border-gold-DEFAULT/60 text-gold-DEFAULT bg-gold-DEFAULT/10"
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs font-heading uppercase tracking-wider text-gray-400 mb-1">
                      Starting at
                    </div>
                    <div className="font-heading font-bold text-2xl text-gray-900">
                      {product.price}
                    </div>
                  </div>
                  <div className="flex gap-3 flex-1">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 btn-primary justify-center text-center text-xs py-3"
                    >
                      Specify Product
                    </Link>
                    <Link
                      href={`/products/${product.id}`}
                      className="btn-outline text-xs py-3 px-5"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
