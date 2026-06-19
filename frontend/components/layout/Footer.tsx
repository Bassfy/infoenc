import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react'
import { SITE_NAME, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '@/lib/constants'

const footerLinks = {
  products: [
    { label: 'Recessed Profiles', href: '/shop/recessed' },
    { label: 'Surface Mounted', href: '/shop/surface-mounted' },
    { label: 'Corner Profiles', href: '/shop/corner' },
    { label: 'Suspended Profiles', href: '/shop/suspended' },
    { label: 'LED Strips', href: '/shop/led-strips' },
    { label: 'COB LED Strips', href: '/shop/cob-strips' },
    { label: 'Drivers & Controllers', href: '/shop/drivers' },
    { label: 'Accessories', href: '/shop/accessories' },
  ],
  applications: [
    { label: 'Residential', href: '/applications/residential' },
    { label: 'Commercial', href: '/applications/commercial' },
    { label: 'Retail', href: '/applications/retail' },
    { label: 'Hospitality', href: '/applications/hospitality' },
    { label: 'Office', href: '/applications/office' },
    { label: 'Landscape', href: '/applications/landscape' },
    { label: 'Smart Home', href: '/applications/smart-home' },
  ],
  resources: [
    { label: 'Product Configurator', href: '/configurator' },
    { label: 'Project Gallery', href: '/gallery' },
    { label: 'Technical Downloads', href: '/downloads' },
    { label: 'Installation Guides', href: '/guides' },
    { label: 'Wattage Calculator', href: '/configurator#calculator' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQs', href: '/faqs' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Projects', href: '/gallery' },
    { label: 'Become a Dealer', href: '/dealer' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const certifications = [
  { label: 'CE', description: 'European Conformity' },
  { label: 'RoHS', description: 'Restriction of Hazardous Substances' },
  { label: 'UL', description: 'Underwriters Laboratories' },
  { label: 'IP67', description: 'Ingress Protection' },
  { label: 'ISO 9001', description: 'Quality Management' },
]

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/5">
      {/* Newsletter Band */}
      <div className="border-b border-white/5">
        <div className="container-max px-6 md:px-12 py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-xs tracking-[0.3em] text-electric uppercase mb-3">Stay Informed</p>
              <h3 className="text-2xl md:text-3xl font-light text-white">
                New products. Project launches.
                <br />
                <span className="text-white/40">Technical insights.</span>
              </h3>
            </div>
            <form
              className="flex w-full max-w-md gap-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/4 border border-white/10 px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none focus:border-electric/40 transition-colors duration-300"
              />
              <button
                type="submit"
                className="bg-electric px-6 py-3.5 text-obsidian text-sm font-medium tracking-widest uppercase hover:bg-electric-300 transition-colors duration-300 flex items-center gap-2 flex-shrink-0"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-max px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 border border-electric/60 rotate-45 transition-transform duration-500 group-hover:rotate-90" />
                <div className="absolute inset-1.5 bg-electric/20 rotate-45 transition-all duration-500 group-hover:bg-electric/40" />
              </div>
              <div>
                <span className="text-white font-light tracking-[0.15em] text-sm uppercase block leading-none">
                  LED Profile
                </span>
                <span className="text-electric text-xs tracking-[0.3em] uppercase font-medium">
                  Decorations
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-8 max-w-xs">
              Premium architectural LED profiles and linear lighting solutions. Engineering precision meets design excellence.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-3 text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
              >
                <Mail className="w-4 h-4 text-electric/60" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
              >
                <Phone className="w-4 h-4 text-electric/60" />
                {CONTACT_PHONE}
              </a>
              <div className="flex items-start gap-3 text-sm text-white/40">
                <MapPin className="w-4 h-4 text-electric/60 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{CONTACT_ADDRESS}</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-8">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-electric/40 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Products', links: footerLinks.products },
            { title: 'Applications', links: footerLinks.applications },
            { title: 'Resources', links: footerLinks.resources },
            { title: 'Company', links: footerLinks.company },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs tracking-[0.25em] text-white uppercase font-medium mb-5">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/35 hover:text-white/80 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-xs tracking-[0.25em] text-white/30 uppercase mb-4">Certifications</p>
          <div className="flex flex-wrap items-center gap-4">
            {certifications.map((cert) => (
              <div
                key={cert.label}
                title={cert.description}
                className="px-3 py-1.5 border border-white/10 text-xs text-white/40 tracking-widest uppercase"
              >
                {cert.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-white/20 tracking-wide">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-white/20 hover:text-white/50 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-white/20 hover:text-white/50 transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/sitemap.xml" className="text-xs text-white/20 hover:text-white/50 transition-colors duration-200">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
