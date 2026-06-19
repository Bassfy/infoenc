'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ArrowRight, X } from 'lucide-react'

const projects = [
  {
    id: '1', slug: 'villa-minerva-amalfi', title: 'Villa Minerva', location: 'Amalfi Coast, Italy', category: 'residential',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85&auto=format&fit=crop',
    size: 'large',
    description: 'Complete architectural lighting overhaul for a 1,200m² private villa. LUX Recessed 35 profiles run continuously across 180 linear metres of ceiling plane.',
    products: ['LUX Recessed 35 Slim', 'COB Elite 480', 'VOLT Driver 300W'],
  },
  {
    id: '2', slug: 'axiom-tower-dubai', title: 'Axiom Tower', location: 'Dubai, UAE', category: 'commercial',
    coverImage: 'https://images.unsplash.com/photo-1497366754035-f200586c6404?w=1200&q=85&auto=format&fit=crop',
    size: 'medium',
    description: 'Grade-A commercial tower lobby and atrium lighting. 320 linear metres of suspended profiles creating dramatic light sculptures.',
    products: ['FLOAT Suspended 70', 'COB Elite 480', 'DALI Controller Pro'],
  },
  {
    id: '3', slug: 'maison-soir-paris', title: 'Maison du Soir', location: 'Paris, France', category: 'hospitality',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85&auto=format&fit=crop',
    size: 'large',
    description: '5-star boutique hotel. Warm 2700K lighting throughout guest rooms, corridors, and restaurant creates an intimate Parisian atmosphere.',
    products: ['PURE Trimless 28', 'COB Standard 320', 'VOLT Driver 150W'],
  },
  {
    id: '4', slug: 'nakamura-flagship-tokyo', title: 'Nakamura Flagship', location: 'Ginza, Tokyo', category: 'retail',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85&auto=format&fit=crop',
    size: 'medium',
    description: 'Luxury fashion flagship store with precision 4000K lighting for optimal product color rendering. CRI 95+ throughout.',
    products: ['ARC Surface Pro 50', 'SMD 2835 Pro', 'SMART Controller DALI'],
  },
  {
    id: '5', slug: 'helix-campus-sf', title: 'Helix Campus', location: 'San Francisco, USA', category: 'office',
    coverImage: 'https://images.unsplash.com/photo-1497366811915-b7f5a5b5a5b5?w=1200&q=85&auto=format&fit=crop',
    size: 'small',
    description: 'Tech campus headquarters with human-centric lighting. Circadian-tunable system from warm morning through cool afternoon tones.',
    products: ['LUX Recessed 35 Slim', 'COB Elite 480', 'SMART Controller DALI'],
  },
  {
    id: '6', slug: 'botanic-garden-singapore', title: 'Botanic Garden Pavilion', location: 'Singapore', category: 'outdoor',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&auto=format&fit=crop',
    size: 'small',
    description: 'Outdoor pavilion with IP67-rated profiles creating sculptural light lines through tropical landscaping.',
    products: ['EDGE Corner 45-XT', 'COB Elite 480', 'VOLT Driver 100W'],
  },
  {
    id: '7', slug: 'nordic-spa-oslo', title: 'Nordic Spa', location: 'Oslo, Norway', category: 'hospitality',
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=85&auto=format&fit=crop',
    size: 'medium',
    description: 'Luxury spa and wellness centre. Water-resistant profiles in wet areas combined with warm 2700K tone for maximum relaxation.',
    products: ['PURE Trimless 28', 'COB Standard 320', 'IP67 Sealed Kit'],
  },
  {
    id: '8', slug: 'loft-conversions-london', title: 'Moorgate Loft', location: 'London, UK', category: 'residential',
    coverImage: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=85&auto=format&fit=crop',
    size: 'small',
    description: 'Industrial-luxe loft with exposed concrete ceilings. Corner profiles follow structural beams for architectural drama.',
    products: ['EDGE Corner 45-XT', 'COB Elite 480', 'OPAL Diffuser'],
  },
]

const categories = [
  { id: 'all', label: 'All Projects' },
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'retail', label: 'Retail' },
  { id: 'office', label: 'Office' },
  { id: 'outdoor', label: 'Outdoor' },
]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  const filtered = activeCategory === 'all' ? projects : projects.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-obsidian pt-24">
      {/* Header */}
      <div className="container-max px-6 md:px-12 py-16">
        <p className="section-subtitle mb-4">Project Gallery</p>
        <h1 className="section-title mb-6">
          Where Light Meets
          <br />
          <span className="text-white/30">Architecture</span>
        </h1>
        <p className="text-white/40 max-w-lg leading-relaxed">
          Over 15,000 installations across five continents. Each project a testament to the transformative power of precision architectural lighting.
        </p>
      </div>

      {/* Category Filter */}
      <div className="container-max px-6 md:px-12 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-2.5 text-xs tracking-widest uppercase transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-electric text-obsidian'
                  : 'border border-white/15 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="container-max px-6 md:px-12 pb-24">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/4">
          <AnimatePresence>
            {filtered.map((project, i) => (
              <motion.button
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => setSelectedProject(project)}
                className={`relative overflow-hidden group text-left ${
                  project.size === 'large' ? 'md:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
                }`}
              >
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-400" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 glass text-[10px] tracking-[0.2em] text-white/60 uppercase">
                    {project.category}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-lg font-light text-white mb-1">{project.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-electric text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Project <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-obsidian/96 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={(e) => e.target === e.currentTarget && setSelectedProject(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-3xl bg-[#0d0d0d] border border-white/8 overflow-hidden"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 glass flex items-center justify-center text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative aspect-video">
                <Image src={selectedProject.coverImage} alt={selectedProject.title} fill className="object-cover" />
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs tracking-[0.3em] text-electric uppercase block mb-2">
                      {selectedProject.category}
                    </span>
                    <h3 className="text-2xl font-light text-white">{selectedProject.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-white/40">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedProject.location}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/50 leading-relaxed mb-6">{selectedProject.description}</p>
                <div className="mb-6">
                  <p className="text-xs tracking-[0.2em] text-white/30 uppercase mb-3">Products Used</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.products.map((p) => (
                      <span key={p} className="px-3 py-1.5 border border-white/10 text-xs text-white/50">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/gallery/${selectedProject.slug}`}
                  className="btn-primary"
                  onClick={() => setSelectedProject(null)}
                >
                  View Full Case Study
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
