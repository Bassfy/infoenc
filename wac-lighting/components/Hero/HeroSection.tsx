"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { ScrollIndicator } from "@/components/UI/ScrollIndicator";
import { MagneticButton } from "@/components/UI/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HeroScene = dynamic(
  () => import("@/components/Scenes/HeroScene").then((m) => ({ default: m.HeroScene })),
  { ssr: false, loading: () => null }
);

gsap.registerPlugin(ScrollTrigger);

const HERO_WORDS = ["Architectural", "Precision", "Illumination"];

export function HeroSection() {
  const mouse = useRef<[number, number]>([0, 0]);
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      ];
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.from(badgeRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".hero-word",
          {
            y: "110%",
            opacity: 0,
            duration: 1.2,
            stagger: 0.12,
            ease: "expo.out",
          },
          "-=0.4"
        )
        .from(
          subRef.current,
          { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .from(
          actionsRef.current,
          { opacity: 0, y: 20, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        )
        .from(
          statsRef.current?.children ? Array.from(statsRef.current.children) : [],
          {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4"
        );

      // Parallax on scroll
      if (sectionRef.current) {
        gsap.to(headlineRef.current, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-start overflow-hidden bg-obsidian-DEFAULT"
    >
      {/* WebGL Canvas */}
      <div className="absolute inset-0 z-0">
        <HeroScene mouse={mouse} />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 z-[1] bg-gradient-to-t from-black to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-40 z-[1] bg-gradient-to-b from-black/60 to-transparent" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-wide pt-32 pb-24 w-full">
        <div className="max-w-4xl">
          {/* Badge */}
          <div ref={badgeRef} className="mb-8">
            <div className="inline-flex items-center gap-3 glass-panel rounded-full px-5 py-2.5 border border-gold-DEFAULT/20">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-DEFAULT animate-pulse" />
              <span className="text-xs font-heading uppercase tracking-[0.3em] text-gold-DEFAULT">
                Since 1984 — Pioneer of Architectural LED
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div ref={headlineRef} className="mb-8">
            <h1 className="font-heading font-bold leading-[1.02] text-balance">
              {HERO_WORDS.map((word, i) => (
                <span key={word} className="block overflow-hidden">
                  <span
                    className={`hero-word inline-block text-display-2xl ${
                      i === 1 ? "text-gradient-gold" : "text-white"
                    }`}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          {/* Subtitle */}
          <div ref={subRef}>
            <p className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed font-light mb-10">
              50,000+ luminaires engineered for architects who refuse to compromise.
              TrueColor™ technology. SmartLink™ integration. Limitless expression.
            </p>
          </div>

          {/* Actions */}
          <div ref={actionsRef} className="flex flex-wrap items-center gap-5 mb-16">
            <MagneticButton>
              <Link href="/products" className="btn-primary">
                Explore Products
                <ArrowRight size={16} />
              </Link>
            </MagneticButton>

            <button className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors duration-300">
              <div className="w-12 h-12 rounded-full border border-white/20 group-hover:border-gold-DEFAULT/50 flex items-center justify-center transition-colors duration-300">
                <Play size={14} className="text-gold-DEFAULT ml-0.5" fill="currentColor" />
              </div>
              <span className="text-sm font-heading uppercase tracking-wider">
                Watch Story
              </span>
            </button>
          </div>

          {/* Quick stats */}
          <div ref={statsRef} className="flex flex-wrap gap-8">
            {[
              { value: "50K+", label: "Products" },
              { value: "CRI 97+", label: "Color Fidelity" },
              { value: "120+", label: "Countries" },
              { value: "100K hrs", label: "LED Lifespan" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <div className="font-heading font-bold text-2xl text-gold-DEFAULT">
                  {stat.value}
                </div>
                <div className="text-xs font-heading uppercase tracking-[0.2em] text-white/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-10 md:right-20 z-10">
        <ScrollIndicator />
      </div>

      {/* Vertical label */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10 hidden xl:flex flex-col items-center gap-4">
        <div
          className="text-[9px] font-heading uppercase tracking-[0.5em] text-white/20"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          WAC Lighting Enterprise
        </div>
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-gold-DEFAULT/30 to-transparent" />
      </div>
    </section>
  );
}
