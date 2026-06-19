'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'

const headlines = [
  'Architecture',
  'Precision',
  'Light',
]

export default function Hero() {
  const [currentLine, setCurrentLine] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLine((prev) => (prev + 1) % headlines.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.8)))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={heroRef} className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${scrollProgress * 120}px) scale(1.15)` }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=2400&q=90&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 via-transparent to-transparent" />
      </div>

      {/* Animated light beam */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 0.15, x: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-0 left-[30%] w-px h-full"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,174,239,0.8), transparent)',
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute top-0 left-[60%] w-px h-full"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(0,174,239,0.6), transparent)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen section-padding">
        <div className="container-max">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-px bg-electric" />
            <span className="text-xs tracking-[0.4em] text-electric uppercase">
              Architectural Linear Lighting
            </span>
          </motion.div>

          {/* Main Headline */}
          <div className="overflow-hidden mb-4">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.19, 1, 0.22, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl xl:text-10xl font-light tracking-tight leading-none text-white"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              Defining
            </motion.h1>
          </div>

          <div className="overflow-hidden mb-2">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="text-6xl md:text-8xl lg:text-9xl xl:text-10xl font-light tracking-tight leading-none relative overflow-hidden h-[1.15em]">
                {headlines.map((word, i) => (
                  <motion.span
                    key={word}
                    className="absolute text-gradient-blue"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{
                      y: currentLine === i ? '0%' : currentLine > i ? '-100%' : '100%',
                      opacity: currentLine === i ? 1 : 0,
                    }}
                    transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="overflow-hidden mb-12">
            <motion.h1
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl xl:text-10xl font-light tracking-tight leading-none text-white/20"
            >
              Through Light
            </motion.h1>
          </div>

          {/* Supporting copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="max-w-xl text-base md:text-lg text-white/50 leading-relaxed mb-12 font-light"
          >
            Premium LED aluminum profiles engineered for architects and designers who refuse to compromise on quality, precision, or aesthetics.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link href="/shop" className="btn-primary group">
              Explore Products
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/configurator" className="btn-secondary group">
              Configure Your System
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="flex items-center gap-10 mt-20 pt-10 border-t border-white/8"
          >
            {[
              { value: '15,000+', label: 'Projects' },
              { value: '98%', label: 'Satisfaction' },
              { value: '120+', label: 'Countries' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-light text-white">{stat.value}</div>
                <div className="text-xs tracking-widest text-white/30 uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.4em] text-white/30 uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </motion.div>
    </div>
  )
}
