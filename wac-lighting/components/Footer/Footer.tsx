"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Linkedin, Youtube, ChevronUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_LINKS = {
  Products: [
    { label: "Interior Lighting", href: "/products/interior" },
    { label: "Exterior Lighting", href: "/products/exterior" },
    { label: "Commercial", href: "/products/commercial" },
    { label: "Smart Lighting", href: "/products/smart" },
    { label: "Track Systems", href: "/products/track" },
    { label: "New Arrivals", href: "/products/new" },
  ],
  Solutions: [
    { label: "Hospitality", href: "/solutions/hospitality" },
    { label: "Retail", href: "/solutions/retail" },
    { label: "Healthcare", href: "/solutions/healthcare" },
    { label: "Museums & Galleries", href: "/solutions/museum" },
    { label: "Residential", href: "/solutions/residential" },
    { label: "Outdoor Spaces", href: "/solutions/outdoor" },
  ],
  Technology: [
    { label: "TrueColor™", href: "/technology/truecolor" },
    { label: "SmartLink™", href: "/technology/smartlink" },
    { label: "Tunable White", href: "/technology/tunable" },
    { label: "Photometric Design", href: "/technology/photometric" },
    { label: "Energy Solutions", href: "/technology/energy" },
    { label: "Certifications", href: "/technology/certs" },
  ],
  Company: [
    { label: "About WAC", href: "/about" },
    { label: "News & Press", href: "/news" },
    { label: "Careers", href: "/careers" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Showrooms", href: "/showrooms" },
    { label: "Find a Rep", href: "/representatives" },
  ],
};

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-col", {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#040404] border-t border-white/[0.04] overflow-hidden"
    >
      {/* Top separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/30 to-transparent" />

      {/* CTA strip */}
      <div className="border-b border-white/[0.04]">
        <div className="container-wide py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="section-label mb-3">Ready to Specify?</div>
              <h3 className="font-heading font-bold text-3xl md:text-4xl text-white">
                Start Your Project <span className="text-gradient-gold">Today</span>
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/contact" className="btn-primary text-xs py-4 px-8">
                Request Specification
                <ArrowRight size={14} />
              </Link>
              <a
                href="tel:+18005262588"
                className="btn-outline text-xs py-4 px-6"
              >
                1-800-526-2588
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand column */}
          <div className="col-span-2 footer-col">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="20" cy="20" r="19" stroke="#C9A84C" strokeWidth="1.5" />
                  <path d="M20 8 L28 24 H12 Z" fill="#C9A84C" opacity="0.9" />
                  <circle cx="20" cy="11" r="2" fill="#E4C76B" />
                </svg>
              </div>
              <div>
                <div className="font-heading font-bold text-white text-lg tracking-[0.15em] uppercase leading-none">
                  WAC
                </div>
                <div className="font-heading text-[9px] tracking-[0.4em] uppercase text-gold-DEFAULT/70 leading-none mt-0.5">
                  Lighting
                </div>
              </div>
            </Link>

            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-[220px]">
              Pioneering architectural LED illumination since 1984. Engineering light that transforms the human experience.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Youtube, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass-panel border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-gold-DEFAULT hover:border-gold-DEFAULT/30 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="footer-col">
              <h4 className="text-[10px] font-heading font-semibold uppercase tracking-[0.3em] text-gold-DEFAULT mb-5">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors duration-200 block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-white/25">
            <span>© 2024 WAC Lighting Co. All rights reserved.</span>
            <span className="hidden md:block">·</span>
            {["Privacy Policy", "Terms of Use", "Accessibility", "Sitemap"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ /g, "-")}`}
                className="hover:text-white/50 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-white/20 font-heading">
              Engineered in the USA
            </div>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full glass-panel border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-gold-DEFAULT hover:border-gold-DEFAULT/30 transition-all duration-300"
              aria-label="Back to top"
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
