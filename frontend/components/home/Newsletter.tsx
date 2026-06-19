'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function Newsletter() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>
      {/* Background image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1615873968403-89e068629265?w=1920&q=85&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-obsidian/88" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 container-max px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="section-subtitle mb-4"
          >
            Stay Connected
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight"
          >
            Light Up Your
            <br />
            <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}>
              Inspiration
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/50 mb-10 leading-relaxed"
          >
            New product launches. Project showcases. Technical insights. Exclusive early access. Join 12,000+ lighting professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="w-12 h-12 text-electric" />
                <p className="text-white text-lg font-light">You&apos;re on the list.</p>
                <p className="text-white/40 text-sm">
                  Welcome to the community of light enthusiasts.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-white/6 border border-white/15 px-5 py-4 text-sm text-white placeholder-white/25 outline-none focus:border-electric/50 transition-colors duration-300"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-electric px-6 py-4 text-obsidian text-sm font-semibold tracking-widest uppercase hover:bg-electric-300 transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xs text-white/20 mt-5 tracking-wide"
          >
            No spam. Unsubscribe at any time. We respect your privacy.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
