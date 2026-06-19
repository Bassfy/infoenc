'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Shield, Zap, Ruler, Award, Headphones, Package } from 'lucide-react'

const features = [
  {
    icon: Ruler,
    title: 'Precision Engineering',
    description:
      'Every profile machined to ±0.1mm tolerance. Our extrusions meet the most demanding architectural specifications.',
    highlight: '±0.1mm tolerance',
  },
  {
    icon: Zap,
    title: 'Premium LED Technology',
    description:
      'OSRAM and Cree chip sets. CRI up to 98. Flicker-free. MacAdam 2-step color consistency guaranteed.',
    highlight: 'CRI up to 98',
  },
  {
    icon: Shield,
    title: 'CE, RoHS & UL Certified',
    description:
      'Full regulatory compliance across 120+ countries. Tested to IEC 62031, IEC 61347, and EN 55015 standards.',
    highlight: 'Global compliance',
  },
  {
    icon: Award,
    title: '25 Years of Excellence',
    description:
      'Trusted by leading architects, interior designers, and lighting consultants on projects across five continents.',
    highlight: '15,000+ installations',
  },
  {
    icon: Package,
    title: 'Custom Lengths & Finishes',
    description:
      'Cut to any length from 300mm to 6000mm. 12 standard finishes. RAL powder coating on request.',
    highlight: 'Made to specification',
  },
  {
    icon: Headphones,
    title: 'Expert Technical Support',
    description:
      'Dedicated lighting engineers available for project consultation, photometric calculations, and specification assistance.',
    highlight: 'Free consultation',
  },
]

export default function WhyChooseUs() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section-padding bg-obsidian relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container-max relative z-10">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left: Title */}
          <div className="lg:sticky lg:top-32">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="section-subtitle mb-4"
            >
              Why LED Profile Decorations
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="section-title mb-6"
            >
              The Standard
              <br />
              <span className="text-white/30">Others Aspire To</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/50 leading-relaxed max-w-md mb-10"
            >
              For 25 years, we have been the trusted partner for architects and designers who demand nothing less than perfection in architectural lighting.
            </motion.p>

            {/* Certification badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap gap-2"
            >
              {['CE', 'RoHS', 'UL Listed', 'ISO 9001', 'IP67', 'ENEC'].map((cert) => (
                <span
                  key={cert}
                  className="px-3 py-1.5 border border-white/10 text-xs text-white/40 tracking-widest uppercase"
                >
                  {cert}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                  className="group p-6 border border-white/6 hover:border-electric/20 transition-all duration-500 hover:bg-white/2"
                >
                  <div className="w-10 h-10 mb-5 flex items-center justify-center border border-white/10 group-hover:border-electric/30 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-electric" />
                  </div>
                  <span className="block text-[10px] tracking-[0.25em] text-electric/70 uppercase mb-2">
                    {feature.highlight}
                  </span>
                  <h3 className="text-base font-medium text-white mb-3 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
