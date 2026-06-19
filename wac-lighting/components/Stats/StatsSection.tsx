"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { RevealText } from "@/components/UI/AnimatedText";
import { useInView } from "@/hooks/useScrollProgress";
import { useCounter } from "@/hooks/useCounter";
import { STATS } from "@/lib/data";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function StatCard({
  stat,
  index,
  inView,
}: {
  stat: (typeof STATS)[0];
  index: number;
  inView: boolean;
}) {
  const count = useCounter(stat.numericValue, 2500, 0, inView);
  const displayValue = stat.suffix === "K+"
    ? `${count}K`
    : stat.suffix === "M+"
    ? `${count}M`
    : count.toString();

  return (
    <motion.div
      className="relative p-8 md:p-10 rounded-2xl border border-gray-100 bg-gray-50 group hover:border-gold-DEFAULT/20 transition-all duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-radial from-gold-DEFAULT/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Number */}
      <div className="relative">
        <div className="flex items-end gap-0 mb-3">
          <span className="font-heading font-black text-5xl md:text-6xl text-gradient-gold leading-none tabular-nums">
            {inView ? displayValue : "0"}
          </span>
          <span className="font-heading font-black text-4xl md:text-5xl text-gold-DEFAULT/60 leading-none mb-0.5">
            {stat.suffix.includes("+") ? "+" : stat.suffix}
          </span>
        </div>

        {/* Bar accent */}
        <div className="w-12 h-0.5 bg-gold-DEFAULT mb-4 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gold-light"
            animate={inView ? { x: ["−100%", "100%"] } : {}}
            transition={{ duration: 2, delay: index * 0.2, repeat: Infinity, repeatDelay: 3 }}
          />
        </div>

        <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
          {stat.label}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {stat.description}
        </p>
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: inViewRef, inView } = useInView(0.2);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scrolling line animation
      gsap.from(".stats-line", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.5,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-section bg-white overflow-hidden"
      id="stats"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(201,168,76,1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative lines */}
      <div className="absolute top-1/2 left-0 right-0 h-px overflow-hidden">
        <div className="stats-line w-full h-full bg-gradient-to-r from-transparent via-gold-DEFAULT/10 to-transparent" />
      </div>

      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-16">
          <RevealText>
            <div className="section-label mb-4">By The Numbers</div>
          </RevealText>
          <RevealText delay={0.1}>
            <h2 className="font-heading font-bold text-display-lg text-gray-900 mb-6">
              Four Decades of
              <br />
              <span className="text-gradient-gold">Industry Leadership</span>
            </h2>
          </RevealText>
          <RevealText delay={0.2}>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              Metrics that reflect a relentless commitment to innovation,
              quality, and the partnerships that define the built environment.
            </p>
          </RevealText>
        </div>

        {/* Stats grid */}
        <div ref={inViewRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} inView={inView} />
          ))}
        </div>

        {/* Awards strip */}
        <div className="mt-20 pt-12 border-t border-gray-100">
          <RevealText className="text-center mb-8">
            <div className="text-xs font-heading uppercase tracking-[0.3em] text-gray-400">
              Recognition & Certifications
            </div>
          </RevealText>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              "Energy Star Partner",
              "DLC Premium Listed",
              "IDA Dark Sky Approved",
              "DesignLights Consortium",
              "IBEW Union Made",
              "ISO 9001 Certified",
            ].map((award, i) => (
              <motion.div
                key={award}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-full border border-gold-DEFAULT/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gold-DEFAULT/30" />
                </div>
                <span className="text-[10px] font-heading uppercase tracking-wider text-gray-400 text-center max-w-[80px]">
                  {award}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
