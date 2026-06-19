"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Maximize2, X } from "lucide-react";
import { RevealText } from "@/components/UI/AnimatedText";
import { PROJECTS } from "@/lib/data";
import type { Project } from "@/types";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "museum", label: "Museum" },
  { value: "commercial", label: "Commercial" },
  { value: "healthcare", label: "Healthcare" },
];

export function ProjectGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const filtered = PROJECTS.filter(
    (p) => activeFilter === "all" || p.category === activeFilter
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".project-card", {
        opacity: 0,
        y: 80,
        stagger: {
          each: 0.1,
          from: "start",
        },
        duration: 1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative py-section bg-gray-50 overflow-hidden"
        id="projects"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/20 to-transparent" />

        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)`,
            backgroundSize: "100px 100px",
          }}
        />

        <div className="container-wide">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <RevealText>
                <div className="section-label mb-4">Project Portfolio</div>
              </RevealText>
              <RevealText delay={0.1}>
                <h2 className="font-heading font-bold text-display-lg text-gray-900">
                  Work That
                  <br />
                  <span className="text-gradient-gold">Defines Spaces</span>
                </h2>
              </RevealText>
            </div>

            <RevealText direction="left" delay={0.2}>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setActiveFilter(f.value)}
                    className={`relative px-4 py-2 text-xs font-heading uppercase tracking-wider rounded-full transition-all duration-300 overflow-hidden ${
                      activeFilter === f.value
                        ? "text-black font-semibold"
                        : "glass-panel text-gray-500 hover:text-gray-900 border border-gray-200"
                    }`}
                  >
                    {activeFilter === f.value && (
                      <motion.span
                        className="absolute inset-0 bg-gold-DEFAULT"
                        layoutId="project-filter"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{f.label}</span>
                  </button>
                ))}
              </div>
            </RevealText>
          </div>

          {/* Masonry Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="project-card break-inside-avoid"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                      index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/3]"
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className={`object-cover transition-transform duration-700 ${
                        hoveredProject === project.id ? "scale-110" : "scale-100"
                      }`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-500 ${
                      hoveredProject === project.id ? "opacity-100" : "opacity-70"
                    }`} />

                    {/* View button */}
                    <motion.div
                      className="absolute top-4 right-4 w-10 h-10 glass-panel-dark rounded-full flex items-center justify-center text-white/60"
                      animate={{ opacity: hoveredProject === project.id ? 1 : 0, scale: hoveredProject === project.id ? 1 : 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Maximize2 size={14} />
                    </motion.div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-heading uppercase tracking-wider bg-gold-DEFAULT/20 text-gold-DEFAULT border border-gold-DEFAULT/20">
                          {project.category}
                        </span>
                        <span className="text-[10px] text-white/40 font-heading">
                          {project.year}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-white text-lg leading-tight mb-1">
                        {project.title}
                      </h3>

                      <div className="flex items-center gap-1 text-white/50 text-xs">
                        <MapPin size={10} />
                        <span>{project.location}</span>
                      </div>

                      <motion.p
                        className="text-white/50 text-sm mt-3 leading-relaxed"
                        animate={{
                          opacity: hoveredProject === project.id ? 1 : 0,
                          height: hoveredProject === project.id ? "auto" : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {project.description.slice(0, 100)}...
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="text-center mt-12">
            <Link href="/projects" className="btn-outline text-xs inline-flex items-center gap-3">
              View All Projects
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
              onClick={() => setSelectedProject(null)}
            />
            <motion.div
              className="relative w-full max-w-4xl glass-panel rounded-3xl overflow-hidden border border-white/[0.08] max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 glass-panel rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                onClick={() => setSelectedProject(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="relative aspect-[16/7] overflow-hidden">
                <Image
                  src={selectedProject.coverImage}
                  alt={selectedProject.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="section-label mb-2">{selectedProject.category}</div>
                    <h2 className="font-heading font-bold text-3xl text-white mb-2">
                      {selectedProject.title}
                    </h2>
                    <div className="flex items-center gap-4 text-white/50 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {selectedProject.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {selectedProject.year}
                      </span>
                      {selectedProject.size && (
                        <span>{selectedProject.size}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/projects/${selectedProject.id}`}
                    className="btn-primary text-xs py-3 px-6"
                  >
                    Full Case Study
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <p className="text-white/70 leading-relaxed mb-6">
                  {selectedProject.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-heading uppercase tracking-wider glass-panel text-white/50 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
