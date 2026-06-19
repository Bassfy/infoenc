"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowRight, Palette, Sun, Zap, Battery, Thermometer, Crosshair } from "lucide-react";
import { RevealText } from "@/components/UI/AnimatedText";
import { TECH_FEATURES } from "@/lib/data";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

const TechScene = dynamic(
  () => import("@/components/Scenes/TechScene").then((m) => ({ default: m.TechScene })),
  { ssr: false, loading: () => null }
);

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP = {
  palette: Palette,
  sun: Sun,
  zap: Zap,
  battery: Battery,
  thermometer: Thermometer,
  crosshair: Crosshair,
};

export function TechSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Beam animations
      gsap.from(".tech-beam", {
        scaleY: 0,
        opacity: 0,
        stagger: 0.2,
        duration: 1.5,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // Feature cards stagger
      gsap.from(".tech-feature", {
        opacity: 0,
        x: -30,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".tech-features-list",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Stats counter
      gsap.from(".tech-metric", {
        textContent: 0,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 50%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const feature = TECH_FEATURES[activeFeature];
  const IconComponent = ICON_MAP[feature.icon as keyof typeof ICON_MAP] || Zap;

  return (
    <section
      ref={sectionRef}
      className="relative py-section bg-obsidian-DEFAULT overflow-hidden"
      id="technology"
    >
      {/* Background mesh gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(64,96,255,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* Animated beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[15, 35, 55, 75, 90].map((left, i) => (
          <div
            key={i}
            className="tech-beam absolute top-0 w-px"
            style={{
              left: `${left}%`,
              height: "100%",
              background: `linear-gradient(180deg, transparent 0%, rgba(201,168,76,${0.04 + i * 0.01}) 30%, rgba(201,168,76,${0.08 + i * 0.02}) 50%, rgba(201,168,76,${0.04 + i * 0.01}) 70%, transparent 100%)`,
            }}
          />
        ))}
      </div>

      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-20">
          <RevealText>
            <div className="section-label mb-4">Innovation Platform</div>
          </RevealText>
          <RevealText delay={0.1}>
            <h2 className="font-heading font-bold text-display-lg text-white mb-6">
              The Science of
              <br />
              <span className="text-gradient-gold">Perfect Light</span>
            </h2>
          </RevealText>
          <RevealText delay={0.2}>
            <p className="text-white/50 max-w-2xl mx-auto leading-relaxed">
              Six breakthrough technologies converge in every WAC luminaire, delivering
              performance that redefines what LED illumination can achieve.
            </p>
          </RevealText>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Feature list */}
          <div className="tech-features-list lg:col-span-2 space-y-2">
            {TECH_FEATURES.map((f, i) => {
              const Icon = ICON_MAP[f.icon as keyof typeof ICON_MAP] || Zap;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFeature(i)}
                  className={`tech-feature w-full text-left p-5 rounded-xl transition-all duration-300 group ${
                    activeFeature === i
                      ? "bg-gold-DEFAULT/10 border border-gold-DEFAULT/30"
                      : "hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      activeFeature === i
                        ? "bg-gold-DEFAULT text-black"
                        : "bg-white/[0.05] text-white/40 group-hover:text-gold-DEFAULT"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-sm text-white mb-1">
                        {f.title}
                      </div>
                      <div className="text-xs text-white/40 leading-relaxed line-clamp-2">
                        {f.description}
                      </div>
                    </div>
                    {f.metric && (
                      <div className="ml-auto shrink-0 text-right">
                        <div className={`font-heading font-bold text-lg ${activeFeature === i ? "text-gold-DEFAULT" : "text-white/20"}`}>
                          {f.metric}
                        </div>
                        <div className="text-[9px] font-heading uppercase tracking-wider text-white/30">
                          {f.metricLabel}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center: 3D Scene */}
          <div className="lg:col-span-1 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-xs mx-auto">
              <div className="w-full h-full">
                <TechScene />
              </div>
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-gold-DEFAULT/5 blur-3xl scale-150 pointer-events-none" />
            </div>
          </div>

          {/* Feature detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {/* Metric display */}
                {feature.metric && (
                  <div className="relative">
                    <div className="text-[80px] font-heading font-black text-gradient-gold leading-none opacity-20 select-none">
                      {feature.metric}
                    </div>
                    <div className="absolute inset-0 flex items-center">
                      <div>
                        <div className="font-heading font-black text-5xl text-gradient-gold">
                          {feature.metric}
                        </div>
                        <div className="text-sm font-heading uppercase tracking-[0.3em] text-gold-DEFAULT/60 mt-1">
                          {feature.metricLabel}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gold-DEFAULT flex items-center justify-center">
                      <IconComponent size={16} className="text-black" />
                    </div>
                    <h3 className="font-heading font-bold text-2xl text-white">
                      {feature.title}
                    </h3>
                  </div>

                  <p className="text-white/70 leading-relaxed mb-6">
                    {feature.detail}
                  </p>

                  {/* Simulated data bar */}
                  <div className="space-y-3">
                    {[
                      { label: "Performance", value: 97 },
                      { label: "Efficiency", value: 94 },
                      { label: "Longevity", value: 99 },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs font-heading uppercase tracking-wider text-white/40 mb-1.5">
                          <span>{bar.label}</span>
                          <span className="text-gold-DEFAULT">{bar.value}%</span>
                        </div>
                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-gold-dark to-gold-light rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.value}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: "expo.out" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/technology"
                  className="inline-flex items-center gap-2 text-sm font-heading uppercase tracking-wider text-gold-DEFAULT hover:text-gold-light transition-colors duration-200"
                >
                  Explore Technology
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
