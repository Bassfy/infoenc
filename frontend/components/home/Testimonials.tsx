'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { TESTIMONIALS } from '@/lib/constants'

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const go = (dir: number) => {
    setDirection(dir)
    setCurrent((prev) => (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  const testimonial = TESTIMONIALS[current]

  return (
    <section className="section-padding bg-obsidian relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-electric/2 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <div ref={ref} className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="section-subtitle mb-4"
          >
            Client Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="section-title"
          >
            Words from
            <br />
            <span className="text-white/30">Those Who Know</span>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {/* Quote Display */}
          <div className="relative min-h-[280px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0 flex flex-col items-center text-center"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-8">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold" fill="#C9A84C" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-xl md:text-2xl lg:text-3xl font-light text-white/80 leading-relaxed tracking-wide mb-10" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Attribution */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/10">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium text-white">{testimonial.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{testimonial.title}</p>
                    <p className="text-xs text-electric/70 mt-0.5">{testimonial.company}</p>
                    {testimonial.project && (
                      <p className="text-xs text-white/25 mt-1 italic">Project: {testimonial.project}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() => go(-1)}
              className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                  className={`h-px transition-all duration-300 ${
                    i === current ? 'w-8 bg-electric' : 'w-4 bg-white/20'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 mt-24 overflow-hidden"
        >
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '2,400+', label: 'Verified Reviews' },
            { value: '97%', label: 'Would Recommend' },
            { value: '25 Years', label: 'Trusted Since 1999' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#0d0d0d] px-8 py-10 text-center"
            >
              <div className="text-3xl font-light text-white mb-2">{stat.value}</div>
              <div className="text-xs tracking-[0.2em] text-white/30 uppercase">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
