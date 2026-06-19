import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'LED Profile Decorations — 25 years of architectural lighting excellence.',
}

const timeline = [
  { year: '1999', event: 'Founded in Los Angeles with a vision to bring European architectural lighting quality to the American market.' },
  { year: '2004', event: 'Opened first international office in Dubai, serving the Gulf region\'s growing luxury construction sector.' },
  { year: '2009', event: 'Launched our proprietary extrusion process, achieving ±0.1mm dimensional tolerance — an industry first.' },
  { year: '2014', event: 'Introduced our first COB LED strip — 240 LED/m — establishing a new benchmark for linear light quality.' },
  { year: '2018', event: 'Singapore showroom opened, serving Southeast Asia and the Pacific. 10,000th project milestone celebrated.' },
  { year: '2021', event: 'Launched the SMART Controller Pro with DALI-2, Bluetooth, and KNX compatibility.' },
  { year: '2024', event: 'COB Elite 480 released — the world\'s densest COB strip at 480 LED/m, achieving true filament-like continuity.' },
]

const team = [
  {
    name: 'Marcus Reynolds',
    title: 'Chief Executive Officer',
    bio: 'Former VP of Engineering at Philips Lighting. 30 years in the lighting industry.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop&crop=face',
  },
  {
    name: 'Elena Vasquez',
    title: 'Chief Design Officer',
    bio: 'IALD award-winning lighting designer. Previously at Arup Lighting.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop&crop=face',
  },
  {
    name: 'Kenji Tanaka',
    title: 'Head of Engineering',
    bio: 'PhD in Photonics, MIT. Former research lead at Cree Lighting.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&auto=format&fit=crop&crop=face',
  },
  {
    name: 'Aisha Al-Rahman',
    title: 'Director, Middle East & Asia',
    bio: 'Architect turned lighting specialist. Harvard GSD graduate.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop&crop=face',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-obsidian pt-24">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1920&q=85&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-obsidian/75" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="section-subtitle mb-4">Since 1999</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight">
            25 Years of Light.
            <br />
            <span className="text-white/30">Engineering. Excellence.</span>
          </h1>
        </div>
      </div>

      {/* Mission */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <p className="section-subtitle mb-4">Our Mission</p>
              <h2 className="section-title mb-8">
                Precision That
                <br />
                <span className="text-white/30">Defines Spaces</span>
              </h2>
              <p className="text-white/50 leading-relaxed mb-6">
                We believe that light is the most powerful design material available to architects and interior designers. When executed with precision, it transforms architecture, defines mood, and creates experiences that endure.
              </p>
              <p className="text-white/50 leading-relaxed mb-8">
                Since 1999, we have been engineering the products and systems that make extraordinary lighting possible — from a single residential project to a 500-room hotel. Our obsession with quality is reflected in every profile we extrude, every LED chip we select, and every IES file we publish.
              </p>
              <Link href="/contact" className="btn-primary">
                Talk to Our Team
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=85&auto=format&fit=crop"
                alt="Our workshop"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-[#080808]">
        <div className="container-max">
          <p className="section-subtitle mb-4 text-center">Our Journey</p>
          <h2 className="section-title text-center mb-16">
            25 Years of
            <br />
            <span className="text-white/30">Innovation</span>
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/6 -translate-x-1/2" />
            <div className="space-y-12">
              {timeline.map((item, i) => (
                <div
                  key={item.year}
                  className={`flex items-start gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <span className="text-3xl font-light text-white/10">{item.year}</span>
                    <p className="text-sm text-white/50 leading-relaxed mt-2 max-w-xs ml-auto">{item.event}</p>
                  </div>
                  <div className="relative z-10 w-4 h-4 bg-obsidian border-2 border-electric rounded-full flex-shrink-0 mt-2" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding">
        <div className="container-max">
          <p className="section-subtitle mb-4 text-center">Leadership Team</p>
          <h2 className="section-title text-center mb-16">
            The People Behind
            <br />
            <span className="text-white/30">the Light</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/4">
            {team.map((member) => (
              <div key={member.name} className="bg-obsidian group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-medium text-white">{member.name}</h3>
                  <p className="text-xs text-electric/70 tracking-widest uppercase mt-1 mb-3">{member.title}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#080808] text-center px-6">
        <p className="section-subtitle mb-4">Ready to Start?</p>
        <h2 className="text-4xl md:text-5xl font-light text-white mb-8 tracking-tight">
          Let&apos;s Design Your
          <br />
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}>
            Perfect Lighting System
          </span>
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/configurator" className="btn-primary">
            Configure Your System
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/contact" className="btn-secondary">
            Speak with an Engineer
          </Link>
        </div>
      </section>
    </div>
  )
}
