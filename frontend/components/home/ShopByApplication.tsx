'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { APPLICATIONS } from '@/lib/constants'

export default function ShopByApplication() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section className="section-padding bg-[#080808]">
      <div className="container-max">
        <div ref={ref} className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="section-subtitle mb-4"
          >
            Shop by Application
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-title"
          >
            Light for Every
            <br />
            <span className="text-white/30">Environment</span>
          </motion.h2>
        </div>

        {/* Grid: 1 large + 6 smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/4 overflow-hidden">
          {/* Hero application card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative aspect-[4/5] lg:aspect-auto lg:min-h-[600px] overflow-hidden group"
            onMouseEnter={() => setHoveredId(APPLICATIONS[0].id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Image
              src={APPLICATIONS[0].image}
              alt={APPLICATIONS[0].label}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <p className="text-xs tracking-[0.3em] text-electric uppercase mb-3">Residential</p>
              <h3 className="text-3xl font-light text-white mb-3">{APPLICATIONS[0].description}</h3>
              <Link
                href={APPLICATIONS[0].href}
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white tracking-widest uppercase transition-all duration-300 group/link"
              >
                Explore
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Remaining applications */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-px">
            {APPLICATIONS.slice(1).map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + (i + 1) * 0.08 }}
                className="relative aspect-square overflow-hidden group"
                onMouseEnter={() => setHoveredId(app.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link href={app.href} className="absolute inset-0">
                  <Image
                    src={app.image}
                    alt={app.label}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent" />
                  <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                      background:
                        hoveredId === app.id
                          ? 'rgba(0, 174, 239, 0.08)'
                          : 'transparent',
                    }}
                  />
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <h3 className="text-sm font-medium text-white tracking-wider mb-1">
                      {app.label}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2 hidden md:block">
                      {app.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-electric text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
