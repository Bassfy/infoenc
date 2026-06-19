"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RevealText } from "@/components/UI/AnimatedText";
import { TIMELINE_EVENTS } from "@/lib/data";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline progress line
      gsap.from(".timeline-line-fill", {
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 70%",
          end: "bottom 30%",
          scrub: true,
        },
      });

      // Timeline items
      gsap.from(".timeline-item", {
        opacity: 0,
        x: -40,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      // About image parallax
      gsap.to(".about-image", {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-section bg-obsidian-DEFAULT overflow-hidden"
      id="about"
    >
      {/* Ambient light blob */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-gold-DEFAULT/[0.04] blur-[100px] rounded-full pointer-events-none" />

      <div className="container-wide">
        {/* Top: Split intro */}
        <div className="grid lg:grid-cols-2 gap-16 mb-24 items-center">
          {/* Left: Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <div className="about-image absolute inset-[-15%] will-change-transform">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80"
                  alt="WAC Lighting facility"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 glass-panel-dark rounded-xl p-4 border border-gold-DEFAULT/20">
                <div className="font-heading font-black text-4xl text-gradient-gold">40+</div>
                <div className="text-xs font-heading uppercase tracking-[0.2em] text-white/50 mt-1">
                  Years of Mastery
                </div>
              </div>
            </div>

            {/* Secondary image */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-xl overflow-hidden border-2 border-obsidian-DEFAULT shadow-2xl hidden md:block">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"
                alt="Precision engineering"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right: Text */}
          <div className="order-1 lg:order-2">
            <RevealText>
              <div className="section-label mb-4">Our Story</div>
            </RevealText>
            <RevealText delay={0.1}>
              <h2 className="font-heading font-bold text-display-lg text-white mb-6">
                Illuminating the
                <br />
                <span className="text-gradient-gold">Human Experience</span>
              </h2>
            </RevealText>
            <RevealText delay={0.2}>
              <p className="text-white/60 text-lg leading-relaxed mb-6">
                Founded in 1984 in New Jersey, WAC Lighting was born from a singular belief: light is not a utility — it is an art form that shapes human experience, emotions, and wellbeing.
              </p>
            </RevealText>
            <RevealText delay={0.3}>
              <p className="text-white/50 leading-relaxed mb-8">
                Today, after four decades of pioneering innovation, we remain a family-owned company with the same founding obsession: creating the finest luminaires ever made. From our first halogen track head to our latest Matter-native smart systems, every product begins and ends with one question — does this change how people experience their world?
              </p>
            </RevealText>

            <RevealText delay={0.4}>
              <div className="flex flex-wrap gap-4 mb-8">
                {[
                  { value: "Family-Owned", label: "Since 1984" },
                  { value: "Union-Made", label: "IBEW Certified" },
                  { value: "US + Global", label: "120+ Countries" },
                ].map((item) => (
                  <div key={item.label} className="px-5 py-3 glass-panel rounded-xl border border-white/[0.06]">
                    <div className="font-heading font-bold text-sm text-white">{item.value}</div>
                    <div className="text-xs text-white/40 font-heading uppercase tracking-wider mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </RevealText>

            <RevealText delay={0.5}>
              <Link href="/about" className="btn-primary inline-flex items-center gap-2 text-xs">
                Our Full Story
                <ArrowRight size={14} />
              </Link>
            </RevealText>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <RevealText className="text-center mb-16">
            <h3 className="font-heading font-bold text-display-md text-white">
              A Legacy Built
              <br />
              <span className="text-gradient-gold">One Innovation at a Time</span>
            </h3>
          </RevealText>

          <div ref={timelineRef} className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/[0.06]">
              <div className="timeline-line-fill absolute inset-0 bg-gradient-to-b from-gold-DEFAULT via-gold-DEFAULT to-transparent" />
            </div>

            <div className="space-y-12">
              {TIMELINE_EVENTS.map((event, index) => (
                <div
                  key={event.year}
                  className={`timeline-item relative grid md:grid-cols-2 gap-8 items-center ${
                    index % 2 === 0 ? "" : "md:[direction:rtl]"
                  }`}
                >
                  {/* Content */}
                  <div className={`md:[direction:ltr] ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                    <div className="inline-block mb-3">
                      <span className="font-display font-bold text-5xl text-gradient-gold opacity-30">
                        {event.year}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-xl text-white mb-3">
                      {event.title}
                    </h4>
                    <p className="text-white/50 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-gold-DEFAULT border-2 border-obsidian-DEFAULT shadow-gold" />
                  </div>

                  {/* Image */}
                  <div className={`md:[direction:ltr] ${index % 2 === 0 ? "md:pl-12" : "md:pr-12"}`}>
                    {event.image && (
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
