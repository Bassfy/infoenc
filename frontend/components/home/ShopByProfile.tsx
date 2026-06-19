'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const profiles = [
  {
    id: 'recessed',
    name: 'Recessed',
    description: 'Seamless flush integration into ceilings and walls. Invisible mounting for the purist aesthetic.',
    href: '/shop/recessed',
    svgPath: 'M 0 40 L 100 40 L 100 60 L 50 60 L 50 80 L 50 60 L 0 60 Z',
    color: '#00AEEF',
    count: 24,
  },
  {
    id: 'surface-mounted',
    name: 'Surface Mounted',
    description: 'Clean surface application. Versatile profiles for direct mounting on any surface.',
    href: '/shop/surface-mounted',
    svgPath: 'M 10 50 L 90 50 L 90 70 L 10 70 Z',
    color: '#00AEEF',
    count: 18,
  },
  {
    id: 'corner',
    name: 'Corner',
    description: 'Precision corner solutions at 45°, 60°, and custom angles for continuous light lines.',
    href: '/shop/corner',
    svgPath: 'M 20 20 L 20 80 L 80 80',
    color: '#C9A84C',
    count: 12,
  },
  {
    id: 'suspended',
    name: 'Suspended',
    description: 'Dramatic pendant installations. Premium suspended systems for high-ceiling spaces.',
    href: '/shop/suspended',
    svgPath: 'M 50 10 L 50 40 M 10 40 L 90 40 L 90 55 L 10 55 Z',
    color: '#00AEEF',
    count: 9,
  },
  {
    id: 'trimless',
    name: 'Trimless',
    description: 'The invisible integration. Zero visible hardware — pure architectural light lines.',
    href: '/shop/trimless',
    svgPath: 'M 0 50 L 100 50',
    color: '#C9A84C',
    count: 8,
  },
  {
    id: 'flexible',
    name: 'Flexible',
    description: 'Curved and custom contour applications. Follow any architectural form precisely.',
    href: '/shop/flexible',
    svgPath: 'M 10 70 Q 30 20 50 50 Q 70 80 90 30',
    color: '#00AEEF',
    count: 6,
  },
]

export default function ShopByProfile() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activeProfile, setActiveProfile] = useState(profiles[0].id)

  const active = profiles.find((p) => p.id === activeProfile)!

  return (
    <section className="section-padding bg-obsidian">
      <div className="container-max">
        <div ref={ref} className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="section-subtitle mb-4"
          >
            Shop by Profile Type
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="section-title"
          >
            Find Your
            <br />
            <span className="text-white/30">Perfect Profile</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Profile Selector */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-0"
          >
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setActiveProfile(profile.id)}
                className={`w-full flex items-center gap-5 p-5 border-l-2 text-left transition-all duration-300 group ${
                  activeProfile === profile.id
                    ? 'border-electric bg-white/3'
                    : 'border-transparent hover:border-white/20 hover:bg-white/2'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3
                      className={`text-base font-medium tracking-wide transition-colors duration-300 ${
                        activeProfile === profile.id ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                      }`}
                    >
                      {profile.name}
                    </h3>
                    <span className="text-[10px] tracking-widest text-white/25 uppercase">
                      {profile.count} products
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed transition-all duration-300 ${
                      activeProfile === profile.id
                        ? 'text-white/50 max-h-20 opacity-100'
                        : 'text-white/0 max-h-0 overflow-hidden'
                    }`}
                  >
                    {profile.description}
                  </p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                    activeProfile === profile.id
                      ? 'text-electric translate-x-0'
                      : 'text-white/20 -translate-x-2'
                  }`}
                />
              </button>
            ))}
          </motion.div>

          {/* Visual Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="aspect-square bg-[#0d0d0d] border border-white/6 flex items-center justify-center relative overflow-hidden">
              {/* Grid background */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              {/* SVG Diagram */}
              <div className="relative z-10 w-48 h-48">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  fill="none"
                  strokeWidth="2"
                >
                  <motion.path
                    key={active.id}
                    d={active.svgPath}
                    stroke={active.color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                </svg>
              </div>

              {/* Profile label */}
              <div className="absolute bottom-6 left-6">
                <p className="text-xs tracking-[0.3em] text-white/30 uppercase">{active.name} Profile</p>
              </div>

              {/* Glow */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(ellipse at center, ${active.color}08, transparent 70%)`,
                }}
              />
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <Link
                href={active.href}
                className="btn-primary w-full justify-center"
              >
                Shop {active.name} Profiles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
