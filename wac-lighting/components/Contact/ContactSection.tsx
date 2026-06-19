"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealText } from "@/components/UI/AnimatedText";
import { MagneticButton } from "@/components/UI/MagneticButton";
import { Phone, Mail, MapPin, ArrowRight, Check, Loader2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROJECT_TYPES = [
  "Residential",
  "Hospitality",
  "Retail",
  "Commercial Office",
  "Healthcare",
  "Education",
  "Museum/Gallery",
  "Outdoor/Landscape",
  "Other",
];

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    message: "",
    budget: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-field", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormState("submitting");

    try {
      await new Promise((res) => setTimeout(res, 1500));
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const fieldClasses = (name: string) => `
    w-full bg-transparent border-b transition-all duration-300 py-4 text-white placeholder:text-white/20 text-sm font-sans outline-none
    ${focusedField === name ? "border-gold-DEFAULT" : errors[name] ? "border-red-500/50" : "border-white/10"}
  `;

  return (
    <section
      ref={sectionRef}
      className="relative py-section bg-[#060606] overflow-hidden"
      id="contact"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-DEFAULT/20 to-transparent" />

      {/* Background glow */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-DEFAULT/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div className="lg:sticky lg:top-32">
            <RevealText>
              <div className="section-label mb-4">Get in Touch</div>
            </RevealText>
            <RevealText delay={0.1}>
              <h2 className="font-heading font-bold text-display-lg text-white mb-6">
                Let&apos;s Build
                <br />
                <span className="text-gradient-gold">Something Remarkable</span>
              </h2>
            </RevealText>
            <RevealText delay={0.2}>
              <p className="text-white/50 leading-relaxed mb-12 max-w-md">
                Whether you&apos;re specifying a luxury residential project or designing the lighting
                for a world-class commercial development — our lighting design team is ready.
              </p>
            </RevealText>

            {/* Contact methods */}
            <RevealText delay={0.3}>
              <div className="space-y-6 mb-12">
                {[
                  {
                    icon: Phone,
                    label: "Call Us",
                    value: "1-800-526-2588",
                    href: "tel:+18005262588",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "info@waclighting.com",
                    href: "mailto:info@waclighting.com",
                  },
                  {
                    icon: MapPin,
                    label: "Headquarters",
                    value: "44 Harbor Park Drive, Port Washington, NY",
                    href: "https://maps.google.com",
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="group flex items-start gap-5"
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    <div className="w-12 h-12 rounded-xl glass-panel border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-gold-DEFAULT/30 transition-colors duration-300">
                      <Icon size={16} className="text-gold-DEFAULT" />
                    </div>
                    <div>
                      <div className="text-xs font-heading uppercase tracking-wider text-white/40 mb-1">
                        {label}
                      </div>
                      <div className="text-white/80 group-hover:text-white transition-colors duration-200">
                        {value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </RevealText>

            {/* Social */}
            <RevealText delay={0.4}>
              <div>
                <div className="text-xs font-heading uppercase tracking-[0.3em] text-white/30 mb-4">
                  Follow Our Work
                </div>
                <div className="flex gap-3">
                  {["Instagram", "LinkedIn", "Pinterest", "YouTube"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="px-4 py-2 text-xs font-heading uppercase tracking-wider rounded-full glass-panel border border-white/[0.06] text-white/40 hover:text-gold-DEFAULT hover:border-gold-DEFAULT/30 transition-all duration-300"
                    >
                      {social}
                    </a>
                  ))}
                </div>
              </div>
            </RevealText>
          </div>

          {/* Right: Form */}
          <div>
            <AnimatePresence mode="wait">
              {formState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <motion.div
                    className="w-20 h-20 rounded-full bg-gold-DEFAULT flex items-center justify-center mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <Check size={32} className="text-black" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-2xl text-white mb-3">
                    Message Received
                  </h3>
                  <p className="text-white/50 mb-8">
                    Our specification team will be in touch within 24 hours.
                  </p>
                  <button
                    onClick={() => setFormState("idle")}
                    className="btn-outline text-xs py-3 px-6"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Grid fields */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { name: "name", label: "Full Name *", type: "text", placeholder: "Your name" },
                      { name: "email", label: "Email Address *", type: "email", placeholder: "email@company.com" },
                      { name: "company", label: "Company / Firm", type: "text", placeholder: "Firm name" },
                      { name: "phone", label: "Phone Number", type: "tel", placeholder: "+1 (555) 000-0000" },
                    ].map((field) => (
                      <div key={field.name} className="contact-field">
                        <label className="text-[10px] font-heading uppercase tracking-[0.3em] text-white/40 mb-2 block">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => setFocusedField(null)}
                          className={fieldClasses(field.name)}
                          disabled={formState === "submitting"}
                        />
                        {errors[field.name] && (
                          <p className="text-red-400 text-xs mt-1">{errors[field.name]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Project type */}
                  <div className="contact-field">
                    <label className="text-[10px] font-heading uppercase tracking-[0.3em] text-white/40 mb-3 block">
                      Project Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleChange("projectType", type)}
                          className={`px-4 py-2 text-xs font-heading uppercase tracking-wider rounded-full border transition-all duration-200 ${
                            formData.projectType === type
                              ? "bg-gold-DEFAULT text-black border-gold-DEFAULT font-semibold"
                              : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/60"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="contact-field">
                    <label className="text-[10px] font-heading uppercase tracking-[0.3em] text-white/40 mb-2 block">
                      Estimated Budget
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => handleChange("budget", e.target.value)}
                      onFocus={() => setFocusedField("budget")}
                      onBlur={() => setFocusedField(null)}
                      className={`${fieldClasses("budget")} appearance-none cursor-pointer`}
                      disabled={formState === "submitting"}
                    >
                      <option value="" className="bg-zinc-900">Select range</option>
                      {["Under $10K", "$10K–$50K", "$50K–$250K", "$250K–$1M", "$1M+", "TBD"].map((b) => (
                        <option key={b} value={b} className="bg-zinc-900">{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="contact-field">
                    <label className="text-[10px] font-heading uppercase tracking-[0.3em] text-white/40 mb-2 block">
                      Project Brief *
                    </label>
                    <textarea
                      placeholder="Tell us about your project, timeline, and specific requirements..."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      rows={5}
                      className={`${fieldClasses("message")} resize-none`}
                      disabled={formState === "submitting"}
                    />
                    {errors.message && (
                      <p className="text-red-400 text-xs mt-1">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <MagneticButton className="w-full">
                    <button
                      type="submit"
                      disabled={formState === "submitting"}
                      className="w-full btn-primary justify-center py-5 text-sm"
                    >
                      {formState === "submitting" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Specification Request
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </MagneticButton>

                  <p className="text-center text-xs text-white/20">
                    By submitting, you agree to our Privacy Policy. We never share your information.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
