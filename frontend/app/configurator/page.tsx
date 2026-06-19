'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Download, ArrowRight, Info, Check } from 'lucide-react'
import { formatPrice, calculateWattage, recommendPowerSupply, estimateLumens, getColorTempLabel } from '@/lib/utils'

type Step = 'profile' | 'strip' | 'power' | 'accessories' | 'summary'

const profileTypes = [
  { id: 'recessed', name: 'Recessed', description: 'Flush with ceiling/wall surface', basePrice: 48.90 },
  { id: 'surface-mounted', name: 'Surface Mounted', description: 'Mounts directly to surface', basePrice: 36.50 },
  { id: 'corner', name: 'Corner 45°', description: 'For corner/edge lighting', basePrice: 42.00 },
  { id: 'suspended', name: 'Suspended', description: 'Pendant/hanging installation', basePrice: 89.00 },
  { id: 'trimless', name: 'Trimless', description: 'No visible frame, pure light', basePrice: 65.00 },
  { id: 'flexible', name: 'Flexible', description: 'Curved surface applications', basePrice: 54.00 },
]

const ledStrips = [
  { id: 'cob-480', name: 'COB Elite 480', type: 'COB', wattsPerM: 12, lumensPerM: 1440, pricePerM: 28.50, cri: 95 },
  { id: 'cob-320', name: 'COB Standard 320', type: 'COB', wattsPerM: 8, lumensPerM: 960, pricePerM: 18.90, cri: 90 },
  { id: 'smd-2835', name: 'SMD 2835 Pro', type: 'SMD', wattsPerM: 14, lumensPerM: 1680, pricePerM: 22.00, cri: 90 },
  { id: 'smd-5630', name: 'SMD 5630 HE', type: 'SMD', wattsPerM: 18, lumensPerM: 2160, pricePerM: 32.00, cri: 80 },
]

const colorTemps = [
  { value: '2700K', label: 'Warm White 2700K', hint: 'Cozy, residential atmosphere' },
  { value: '3000K', label: 'Soft White 3000K', hint: 'Warm, hospitality & retail' },
  { value: '4000K', label: 'Neutral White 4000K', hint: 'Balanced, office & commercial' },
  { value: '5000K', label: 'Cool White 5000K', hint: 'Bright, task-focused spaces' },
  { value: '6500K', label: 'Daylight 6500K', hint: 'Maximum brightness, industrial' },
]

const finishes = [
  { id: 'silver', name: 'Anodized Silver', color: '#C0C0C0' },
  { id: 'black', name: 'Anodized Black', color: '#1a1a1a' },
  { id: 'white', name: 'Matte White', color: '#F5F5F5' },
  { id: 'gold', name: 'Brushed Gold', color: '#C9A84C' },
]

const diffusers = [
  { id: 'clear', name: 'Clear', description: 'Maximum brightness, direct light' },
  { id: 'opal', name: 'Opal', description: 'Soft, diffused light — hides hotspots' },
  { id: 'frosted', name: 'Frosted', description: 'Balanced diffusion' },
  { id: 'prismatic', name: 'Prismatic', description: 'Wide beam angle, even distribution' },
]

const steps: { id: Step; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'strip', label: 'LED Strip' },
  { id: 'power', label: 'Power' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'summary', label: 'Summary' },
]

export default function ConfiguratorPage() {
  const [currentStep, setCurrentStep] = useState<Step>('profile')
  const [config, setConfig] = useState({
    profileType: profileTypes[0],
    length: 2,
    finish: finishes[0],
    diffuser: diffusers[1],
    ledStrip: ledStrips[0],
    colorTemp: colorTemps[1].value,
    voltage: '24V',
    cri: 95,
    driver: 'included',
    endCaps: true,
    mountingClips: true,
    suspensionKit: false,
  })

  const wattage = useMemo(
    () => calculateWattage(config.length, config.ledStrip.wattsPerM),
    [config.length, config.ledStrip.wattsPerM]
  )

  const lumens = useMemo(
    () => estimateLumens(config.ledStrip.wattsPerM) * config.length,
    [config.ledStrip.wattsPerM, config.length]
  )

  const totalPrice = useMemo(() => {
    let price = config.profileType.basePrice * config.length
    price += config.ledStrip.pricePerM * config.length
    if (config.driver === 'included') price += wattage * 1.2
    if (config.endCaps) price += 4.90
    if (config.mountingClips) price += (config.length * 2) * 0.80
    if (config.suspensionKit) price += 28.00
    return price
  }, [config, wattage])

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  const nextStep = () => {
    const next = steps[currentStepIndex + 1]
    if (next) setCurrentStep(next.id)
  }
  const prevStep = () => {
    const prev = steps[currentStepIndex - 1]
    if (prev) setCurrentStep(prev.id)
  }

  return (
    <div className="min-h-screen bg-obsidian pt-24">
      {/* Hero */}
      <div className="container-max px-6 md:px-12 py-12 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="section-subtitle mb-3">System Configurator</p>
            <h1 className="text-4xl font-light text-white tracking-tight">
              Design Your Lighting System
            </h1>
            <p className="text-white/40 mt-2 text-sm">
              Configure your complete LED profile system with real-time pricing
            </p>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 glass border border-white/10">
            <Calculator className="w-4 h-4 text-electric" />
            <span className="text-sm text-white/60">Live price:</span>
            <span className="text-lg font-light text-white">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="container-max px-6 md:px-12 py-6 border-b border-white/5">
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => i <= currentStepIndex && setCurrentStep(step.id)}
                className={`flex items-center gap-2 text-xs tracking-[0.2em] uppercase transition-all duration-200 ${
                  step.id === currentStep
                    ? 'text-white'
                    : i < currentStepIndex
                    ? 'text-electric cursor-pointer'
                    : 'text-white/20 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center border text-[10px] font-bold transition-all duration-200 ${
                    step.id === currentStep
                      ? 'border-electric bg-electric text-obsidian'
                      : i < currentStepIndex
                      ? 'border-electric text-electric'
                      : 'border-white/15 text-white/20'
                  }`}
                >
                  {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="hidden md:block">{step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-3 transition-colors duration-300 ${i < currentStepIndex ? 'bg-electric/40' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container-max px-6 md:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Step Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* STEP 1: Profile */}
              {currentStep === 'profile' && (
                <div>
                  <h2 className="text-2xl font-light text-white mb-8">Select Profile Type & Configuration</h2>

                  <div className="mb-8">
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-4">Profile Type</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profileTypes.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => setConfig((c) => ({ ...c, profileType: profile }))}
                          className={`p-4 border text-left transition-all duration-200 ${
                            config.profileType.id === profile.id
                              ? 'border-electric bg-electric/5'
                              : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-white">{profile.name}</h3>
                            <span className="text-xs text-electric">{formatPrice(profile.basePrice)}/m</span>
                          </div>
                          <p className="text-xs text-white/40">{profile.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-4">
                      Total Length: <span className="text-white">{config.length}m</span>
                    </p>
                    <input
                      type="range"
                      min="0.5"
                      max="30"
                      step="0.5"
                      value={config.length}
                      onChange={(e) => setConfig((c) => ({ ...c, length: +e.target.value }))}
                      className="w-full accent-electric"
                    />
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>0.5m</span><span>15m</span><span>30m</span>
                    </div>
                    <p className="text-xs text-white/30 mt-3 flex items-center gap-1.5">
                      <Info className="w-3 h-3" />
                      For lengths over 30m, multiple runs with separate drivers are recommended
                    </p>
                  </div>

                  <div className="mb-8">
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-4">Finish</p>
                    <div className="flex items-center gap-3">
                      {finishes.map((finish) => (
                        <button
                          key={finish.id}
                          onClick={() => setConfig((c) => ({ ...c, finish }))}
                          title={finish.name}
                          className={`w-10 h-10 transition-all duration-200 ${
                            config.finish.id === finish.id
                              ? 'ring-2 ring-electric ring-offset-2 ring-offset-obsidian'
                              : 'ring-1 ring-white/20'
                          }`}
                          style={{ background: finish.color }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/40 mt-2">{config.finish.name}</p>
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-4">Diffuser</p>
                    <div className="grid grid-cols-2 gap-3">
                      {diffusers.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setConfig((c) => ({ ...c, diffuser: d }))}
                          className={`p-3 border text-left transition-all duration-200 ${
                            config.diffuser.id === d.id ? 'border-electric bg-electric/5' : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <p className="text-sm text-white">{d.name}</p>
                          <p className="text-xs text-white/40 mt-0.5">{d.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LED Strip */}
              {currentStep === 'strip' && (
                <div>
                  <h2 className="text-2xl font-light text-white mb-8">Select LED Strip</h2>

                  <div className="mb-8">
                    <div className="grid grid-cols-1 gap-3">
                      {ledStrips.map((strip) => (
                        <button
                          key={strip.id}
                          onClick={() => setConfig((c) => ({ ...c, ledStrip: strip }))}
                          className={`p-5 border text-left transition-all duration-200 ${
                            config.ledStrip.id === strip.id ? 'border-electric bg-electric/5' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-sm font-medium text-white">{strip.name}</h3>
                              <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest ${strip.type === 'COB' ? 'bg-electric/20 text-electric' : 'bg-gold/20 text-gold'}`}>
                                {strip.type}
                              </span>
                            </div>
                            <span className="text-sm text-electric">{formatPrice(strip.pricePerM)}/m</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                              <p className="text-xs text-white/30">Power</p>
                              <p className="text-sm text-white">{strip.wattsPerM}W/m</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-white/30">Output</p>
                              <p className="text-sm text-white">{strip.lumensPerM} lm/m</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-white/30">CRI</p>
                              <p className="text-sm text-white">Ra {strip.cri}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-4">Color Temperature</p>
                    <div className="space-y-2">
                      {colorTemps.map((ct) => (
                        <button
                          key={ct.value}
                          onClick={() => setConfig((c) => ({ ...c, colorTemp: ct.value }))}
                          className={`w-full flex items-center justify-between p-4 border text-left transition-all duration-200 ${
                            config.colorTemp === ct.value ? 'border-electric bg-electric/5' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <span className="text-sm text-white">{ct.label}</span>
                            <span className="block text-xs text-white/40 mt-0.5">{ct.hint}</span>
                          </div>
                          <div
                            className="w-8 h-8 rounded-full border border-white/20"
                            style={{
                              background: ct.value === '2700K' ? '#FFD27F' : ct.value === '3000K' ? '#FFE0A0' : ct.value === '4000K' ? '#FFFFF0' : ct.value === '5000K' ? '#F0F8FF' : '#E8F4FD',
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-4">Voltage</p>
                    <div className="flex items-center gap-3">
                      {['12V', '24V', '48V'].map((v) => (
                        <button
                          key={v}
                          onClick={() => setConfig((c) => ({ ...c, voltage: v }))}
                          className={`px-6 py-3 border text-sm font-medium transition-all duration-200 ${
                            config.voltage === v ? 'border-electric text-white bg-electric/10' : 'border-white/15 text-white/50 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Power */}
              {currentStep === 'power' && (
                <div>
                  <h2 className="text-2xl font-light text-white mb-8">Power Configuration</h2>
                  <div className="p-6 bg-[#181818] border border-electric/20 mb-8">
                    <p className="text-xs tracking-[0.2em] text-electric uppercase mb-4">Calculated Requirements</p>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-white/40">Min. Driver Wattage</p>
                        <p className="text-2xl font-light text-white mt-1">{wattage}W</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Total Lumens</p>
                        <p className="text-2xl font-light text-white mt-1">{lumens.toLocaleString()} lm</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Recommended</p>
                        <p className="text-lg font-light text-white mt-1">{recommendPowerSupply(wattage)}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.2em] text-white/50 uppercase mb-4">Driver Option</p>
                    <div className="space-y-3">
                      {[
                        { id: 'included', label: 'Include Compatible Driver', desc: `${recommendPowerSupply(wattage)} — automatically selected` },
                        { id: 'own', label: 'I will source my own driver', desc: 'Driver specifications provided in download package' },
                        { id: 'dali', label: 'DALI-2 Dimmable Driver', desc: 'For smart building integration — compatible with Helvar, Lutron' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setConfig((c) => ({ ...c, driver: opt.id }))}
                          className={`w-full p-4 border text-left transition-all duration-200 ${
                            config.driver === opt.id ? 'border-electric bg-electric/5' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <p className="text-sm text-white">{opt.label}</p>
                          <p className="text-xs text-white/40 mt-1">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Accessories */}
              {currentStep === 'accessories' && (
                <div>
                  <h2 className="text-2xl font-light text-white mb-8">Accessories</h2>
                  <div className="space-y-4">
                    {[
                      {
                        id: 'endCaps',
                        key: 'endCaps' as const,
                        label: 'End Caps (pair)',
                        desc: 'Precision machined aluminum end caps — finish matches profile',
                        price: 4.90,
                        required: true,
                      },
                      {
                        id: 'mountingClips',
                        key: 'mountingClips' as const,
                        label: `Mounting Clips (${Math.ceil(config.length * 2)} pcs)`,
                        desc: 'Tool-free spring clips every 500mm — calculated for your length',
                        price: config.length * 2 * 0.80,
                        required: false,
                      },
                      {
                        id: 'suspensionKit',
                        key: 'suspensionKit' as const,
                        label: 'Suspension Kit',
                        desc: 'For suspended/pendant installation — adjustable 300–2000mm cables',
                        price: 28.00,
                        required: false,
                        onlyFor: config.profileType.id === 'suspended',
                      },
                    ].map((acc) => (
                      <div
                        key={acc.id}
                        className={`flex items-center justify-between p-5 border transition-all duration-200 ${
                          config[acc.key] ? 'border-electric/30 bg-electric/3' : 'border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            onClick={() => !acc.required && setConfig((c) => ({ ...c, [acc.key]: !c[acc.key] }))}
                            className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                              config[acc.key] ? 'border-electric bg-electric' : 'border-white/20'
                            } ${acc.required ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {config[acc.key] && <Check className="w-3 h-3 text-obsidian" />}
                          </div>
                          <div>
                            <p className="text-sm text-white">
                              {acc.label}
                              {acc.required && <span className="ml-2 text-[10px] text-electric uppercase tracking-widest">Recommended</span>}
                            </p>
                            <p className="text-xs text-white/40 mt-0.5">{acc.desc}</p>
                          </div>
                        </div>
                        <span className="text-sm text-white ml-4 flex-shrink-0">{formatPrice(acc.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Summary */}
              {currentStep === 'summary' && (
                <div>
                  <h2 className="text-2xl font-light text-white mb-8">Configuration Summary</h2>
                  <div className="space-y-0 border border-white/8">
                    {[
                      { label: 'Profile Type', value: config.profileType.name },
                      { label: 'Total Length', value: `${config.length}m` },
                      { label: 'Finish', value: config.finish.name },
                      { label: 'Diffuser', value: config.diffuser.name },
                      { label: 'LED Strip', value: config.ledStrip.name },
                      { label: 'Color Temperature', value: `${config.colorTemp} — ${getColorTempLabel(config.colorTemp)}` },
                      { label: 'Voltage', value: config.voltage },
                      { label: 'CRI', value: `Ra ${config.ledStrip.cri}` },
                      { label: 'Driver', value: config.driver === 'included' ? recommendPowerSupply(wattage) : config.driver === 'dali' ? 'DALI-2 Dimmable' : 'Self-sourced' },
                      { label: 'End Caps', value: config.endCaps ? 'Included' : 'Not included' },
                      { label: 'Mounting Clips', value: config.mountingClips ? `${Math.ceil(config.length * 2)} pcs` : 'Not included' },
                      { label: 'Suspension Kit', value: config.suspensionKit ? 'Included' : 'Not included' },
                      { label: 'Total Output', value: `${lumens.toLocaleString()} lumens` },
                      { label: 'Total Power', value: `${wattage}W` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0">
                        <span className="text-xs text-white/40 tracking-wide">{label}</span>
                        <span className="text-sm text-white">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-5 bg-electric/8 border border-electric/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white uppercase tracking-widest">Estimated Total</span>
                      <span className="text-3xl font-light text-white">{formatPrice(totalPrice)}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-2">* Prices subject to confirmation. Includes all selected components.</p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button className="btn-primary justify-center">
                      <ShoppingBag className="w-4 h-4" />
                      Add Configuration to Cart
                    </button>
                    <button className="btn-secondary justify-center">
                      <Download className="w-4 h-4" />
                      Download Quote PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/6">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="btn-secondary px-6 py-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                {currentStepIndex < steps.length - 1 && (
                  <button onClick={nextStep} className="btn-primary px-6 py-3 text-xs">
                    Continue →
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Live Preview Sidebar */}
          <div className="space-y-4">
            <div className="p-5 bg-[#181818] border border-white/8">
              <h3 className="text-xs tracking-[0.25em] text-white uppercase mb-5">Live Configuration</h3>
              <div className="space-y-3">
                {[
                  { label: 'Profile', value: config.profileType.name },
                  { label: 'Length', value: `${config.length}m` },
                  { label: 'Strip', value: config.ledStrip.name },
                  { label: 'Color Temp', value: config.colorTemp },
                  { label: 'Finish', value: config.finish.name },
                  { label: 'Voltage', value: config.voltage },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-white/35">{label}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[#181818] border border-electric/15">
              <h3 className="text-xs tracking-[0.25em] text-electric uppercase mb-4">Estimated Total</h3>
              <div className="text-3xl font-light text-white mb-1">{formatPrice(totalPrice)}</div>
              <p className="text-xs text-white/30">All components included</p>
            </div>

            <div className="p-5 bg-[#181818] border border-white/8 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Power Required</span>
                <span className="text-white">{wattage}W</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Total Lumens</span>
                <span className="text-white">{lumens.toLocaleString()} lm</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Driver Needed</span>
                <span className="text-white text-right">{recommendPowerSupply(wattage)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
