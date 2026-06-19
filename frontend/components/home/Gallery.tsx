'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, X, MapPin } from 'lucide-react'
import { GALLERY_PROJECTS } from '@/lib/constants'

const categoryLabels: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  hospitality: 'Hospitality',
  retail: 'Retail',
  office: 'Office',
  outdoor: 'Outdoor',
}

export default function Gallery() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [selectedProject, setSelectedProject] = useState<typeof GALLERY_PROJECTS[0] | null>(null)

  return (
    <section className="section-padding bg-[#080808] relative overflow-hidden">
      <div className="container-max">
        <div ref={ref} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="section-subtitle mb-4"
            >
              Project Gallery
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="section-title"
            >
              Excellence in
              <br />
              <span className="text-white/30">Every Installation</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white tracking-widest uppercase transition-all duration-300 group"
            >
              View All Projects
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/4">
          {GALLERY_PROJECTS.map((project, i) => (
            <motion.button
              key={project.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }}
              onClick={() => setSelectedProject(project)}
              className={`relative overflow-hidden group text-left ${
                i === 0 ? 'md:row-span-2 aspect-[3/4] md:aspect-auto' : 'aspect-[4/3]'
              }`}
            >
              <Image
                src={project.coverImage!}
                alt={project.title!}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-107"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-400" />

              {/* Category badge */}
              <div className="absolute top-5 left-5">
                <span className="px-3 py-1.5 glass text-xs tracking-[0.2em] text-white/60 uppercase">
                  {categoryLabels[project.category!]}
                </span>
              </div>

              {/* Info */}
              <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                <h3 className="text-xl font-light text-white mb-1.5">{project.title}</h3>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <MapPin className="w-3 h-3" />
                  {project.location}
                </div>
                <div className="flex items-center gap-1 mt-3 text-electric text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View Project <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-obsidian/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={(e) => e.target === e.currentTarget && setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl glass border border-white/8"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 glass flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative aspect-video">
                <Image
                  src={selectedProject.coverImage!}
                  alt={selectedProject.title!}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <span className="text-xs tracking-[0.3em] text-electric uppercase">
                  {categoryLabels[selectedProject.category!]}
                </span>
                <h3 className="text-2xl font-light text-white mt-2 mb-2">{selectedProject.title}</h3>
                <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
                  <MapPin className="w-4 h-4" />
                  {selectedProject.location}
                </div>
                <Link
                  href={`/gallery/${selectedProject.slug}`}
                  className="btn-primary"
                  onClick={() => setSelectedProject(null)}
                >
                  View Full Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
