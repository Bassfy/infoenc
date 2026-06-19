'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import CountUp from 'react-countup'

const stats = [
  { value: 15000, suffix: '+', label: 'Projects Installed Worldwide' },
  { value: 98, suffix: '%', label: 'Client Satisfaction Rate' },
  { value: 120, suffix: '+', label: 'Countries Served' },
  { value: 25, suffix: '', label: 'Years of Engineering Excellence' },
]

export default function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-150px' })

  return (
    <section ref={ref} className="py-0 bg-[#080808] border-y border-white/5 overflow-hidden">
      <div className="container-max">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="py-16 px-8 text-center border-r border-white/5 last:border-0"
            >
              <div className="text-4xl md:text-5xl font-light text-white mb-3 tracking-tight">
                {inView ? (
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    separator=","
                    delay={i * 0.15}
                  />
                ) : (
                  0
                )}
                <span className="text-electric">{stat.suffix}</span>
              </div>
              <p className="text-xs tracking-[0.2em] text-white/30 uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
