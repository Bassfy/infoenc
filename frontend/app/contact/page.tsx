'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '@/lib/constants'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', company: '', phone: '',
    subject: 'Project Inquiry', message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-obsidian pt-24">
      {/* Hero */}
      <div className="container-max px-6 md:px-12 py-16 border-b border-white/5">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-subtitle mb-4">
          Contact Us
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="section-title"
        >
          Let&apos;s Create Something
          <br />
          <span className="text-white/30">Extraordinary</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 mt-4 max-w-lg leading-relaxed"
        >
          Whether you have a project in mind, a technical question, or want to explore our product range — our team of lighting engineers is ready to assist.
        </motion.p>
      </div>

      <div className="container-max px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Form */}
          <div>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <CheckCircle className="w-16 h-16 text-electric mb-6" />
                <h3 className="text-2xl font-light text-white mb-3">Message Sent</h3>
                <p className="text-white/50 leading-relaxed">
                  Thank you for reaching out. Our team will respond within one business day.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs tracking-[0.2em] text-white/40 uppercase mb-2">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] text-white/40 uppercase mb-2">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs tracking-[0.2em] text-white/40 uppercase mb-2">Company</label>
                    <input
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      className="input-field"
                      placeholder="Architecture firm, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] text-white/40 uppercase mb-2">Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="input-field"
                      placeholder="+1 (000) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs tracking-[0.2em] text-white/40 uppercase mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="input-field"
                  >
                    <option>Project Inquiry</option>
                    <option>Product Information</option>
                    <option>Technical Support</option>
                    <option>Custom Order</option>
                    <option>Become a Dealer</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs tracking-[0.2em] text-white/40 uppercase mb-2">Message *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us about your project, required products, timeline, and any specific technical requirements..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">Contact Information</h3>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
                  { icon: Phone, label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}` },
                  { icon: MapPin, label: 'Address', value: CONTACT_ADDRESS, href: '#' },
                  { icon: Clock, label: 'Business Hours', value: 'Mon–Fri: 8:00 AM — 6:00 PM PST', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-electric" />
                    </div>
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest mb-1">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-white/70 hover:text-white transition-colors duration-200 leading-relaxed">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-white/70 leading-relaxed">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/6">
              <h3 className="text-xs tracking-[0.3em] text-white/30 uppercase mb-6">Offices & Showrooms</h3>
              <div className="space-y-4">
                {[
                  { city: 'Los Angeles', address: '2450 Industrial Drive, Suite 100', country: 'USA' },
                  { city: 'Dubai', address: 'Business Bay, Bay Square Building 10', country: 'UAE' },
                  { city: 'Singapore', address: '8 Shenton Way, AXA Tower', country: 'Singapore' },
                  { city: 'London', address: '1 Canada Square, Canary Wharf', country: 'UK' },
                ].map((office) => (
                  <div key={office.city} className="p-4 border border-white/6 hover:border-white/12 transition-colors duration-200">
                    <p className="text-sm font-medium text-white">{office.city}</p>
                    <p className="text-xs text-white/40 mt-0.5">{office.address}</p>
                    <p className="text-[10px] text-electric/60 tracking-widest uppercase mt-0.5">{office.country}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
