import type { NavigationItem, Product, Project, Testimonial, Brand } from './types'

export const SITE_NAME = 'LED Profile Decorations'
export const SITE_TAGLINE = 'Architectural Lighting Excellence'
export const SITE_DESCRIPTION =
  'Premium LED aluminum profiles and architectural linear lighting solutions for residential, commercial, and hospitality projects.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ledprofiledecorations.com'

export const CONTACT_EMAIL = 'studio@ledprofiledecorations.com'
export const CONTACT_PHONE = '+1 (800) 535-4274'
export const CONTACT_ADDRESS = '2450 Industrial Drive, Suite 100, Los Angeles, CA 90058'

export const NAVIGATION: NavigationItem[] = [
  {
    label: 'Products',
    href: '/shop',
    children: [
      {
        label: 'Recessed Profiles',
        href: '/shop/recessed',
        description: 'Seamless integration into ceilings and walls',
      },
      {
        label: 'Surface Mounted',
        href: '/shop/surface-mounted',
        description: 'Clean surface application for any environment',
      },
      {
        label: 'Corner Profiles',
        href: '/shop/corner',
        description: 'Precise 90° and custom angle solutions',
      },
      {
        label: 'Suspended Profiles',
        href: '/shop/suspended',
        description: 'Dramatic floating light installations',
      },
      {
        label: 'Trimless Profiles',
        href: '/shop/trimless',
        description: 'Invisible integration for purist aesthetics',
      },
      {
        label: 'Flexible Profiles',
        href: '/shop/flexible',
        description: 'Curved and custom shape applications',
      },
      {
        label: 'LED Strips',
        href: '/shop/led-strips',
        description: 'Premium SMD and COB LED strips',
      },
      {
        label: 'Drivers & Power',
        href: '/shop/drivers',
        description: 'Professional-grade power solutions',
      },
      {
        label: 'Accessories',
        href: '/shop/accessories',
        description: 'Connectors, end caps, mounting clips',
      },
    ],
  },
  {
    label: 'Applications',
    href: '/applications',
    children: [
      { label: 'Residential', href: '/applications/residential', description: 'Home lighting mastery' },
      { label: 'Commercial', href: '/applications/commercial', description: 'Professional workplace lighting' },
      { label: 'Retail', href: '/applications/retail', description: 'Enhance product presentation' },
      { label: 'Hospitality', href: '/applications/hospitality', description: 'Hotels, restaurants, resorts' },
      { label: 'Office', href: '/applications/office', description: 'Productive environment design' },
      { label: 'Landscape', href: '/applications/landscape', description: 'Outdoor architectural lighting' },
      { label: 'Smart Home', href: '/applications/smart-home', description: 'Intelligent lighting systems' },
    ],
  },
  { label: 'Configurator', href: '/configurator' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
]

export const PRODUCT_CATEGORIES = [
  { id: 'recessed', label: 'Recessed Profiles', icon: '▭', count: 24 },
  { id: 'surface-mounted', label: 'Surface Mounted', icon: '▬', count: 18 },
  { id: 'corner', label: 'Corner Profiles', icon: '◤', count: 12 },
  { id: 'suspended', label: 'Suspended Profiles', icon: '⊡', count: 9 },
  { id: 'trimless', label: 'Trimless Profiles', icon: '▭', count: 8 },
  { id: 'flexible', label: 'Flexible Profiles', icon: '⌒', count: 6 },
  { id: 'led-strips', label: 'LED Strips', icon: '≡', count: 32 },
  { id: 'cob-strips', label: 'COB LED Strips', icon: '≡', count: 14 },
  { id: 'drivers', label: 'Drivers', icon: '⚡', count: 20 },
  { id: 'controllers', label: 'Controllers', icon: '◈', count: 11 },
  { id: 'power-supplies', label: 'Power Supplies', icon: '⚡', count: 16 },
  { id: 'diffusers', label: 'Diffusers', icon: '◻', count: 8 },
  { id: 'accessories', label: 'Accessories', icon: '⊕', count: 45 },
  { id: 'connectors', label: 'Connectors', icon: '⊞', count: 30 },
  { id: 'end-caps', label: 'End Caps', icon: '⊢', count: 15 },
  { id: 'mounting-clips', label: 'Mounting Clips', icon: '⊙', count: 12 },
]

export const APPLICATIONS = [
  {
    id: 'residential',
    label: 'Residential',
    description: 'Transform living spaces with architectural lighting',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80&auto=format&fit=crop',
    href: '/applications/residential',
  },
  {
    id: 'commercial',
    label: 'Commercial',
    description: 'Define corporate identity through light',
    image: 'https://images.unsplash.com/photo-1497366754035-f200586c6404?w=800&q=80&auto=format&fit=crop',
    href: '/applications/commercial',
  },
  {
    id: 'retail',
    label: 'Retail',
    description: 'Elevate product presentation and brand experience',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop',
    href: '/applications/retail',
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    description: 'Create ambiance that defines luxury stays',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80&auto=format&fit=crop',
    href: '/applications/hospitality',
  },
  {
    id: 'office',
    label: 'Office',
    description: 'Productive environments through biophilic design',
    image: 'https://images.unsplash.com/photo-1497366811915-b7f5a5b5a5b5?w=800&q=80&auto=format&fit=crop',
    href: '/applications/office',
  },
  {
    id: 'landscape',
    label: 'Landscape',
    description: 'Outdoor architectural illumination',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
    href: '/applications/landscape',
  },
  {
    id: 'smart-home',
    label: 'Smart Home',
    description: 'Intelligent systems for modern living',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80&auto=format&fit=crop',
    href: '/applications/smart-home',
  },
]

export const STATS = [
  { value: 15000, label: 'Projects Completed', suffix: '+' },
  { value: 98, label: 'Client Satisfaction', suffix: '%' },
  { value: 120, label: 'Countries Served', suffix: '+' },
  { value: 25, label: 'Years of Excellence', suffix: '' },
]

export const FEATURED_PRODUCTS: Partial<Product>[] = [
  {
    id: '1',
    slug: 'lux-recessed-35-slim',
    name: 'LUX Recessed 35 Slim',
    shortDescription: 'Ultra-slim recessed profile for invisible ceiling integration',
    price: 48.90,
    compareAtPrice: 62.00,
    images: [
      'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop',
    ],
    category: 'recessed',
    rating: 4.9,
    reviewCount: 127,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    inStock: true,
  },
  {
    id: '2',
    slug: 'arc-surface-pro-50',
    name: 'ARC Surface Pro 50',
    shortDescription: 'Architectural surface profile with premium anodized finish',
    price: 36.50,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop',
    ],
    category: 'surface-mounted',
    rating: 4.8,
    reviewCount: 89,
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    inStock: true,
  },
  {
    id: '3',
    slug: 'edge-corner-45-xt',
    name: 'EDGE Corner 45-XT',
    shortDescription: 'Precision 45° corner profile for continuous light lines',
    price: 42.00,
    images: [
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&auto=format&fit=crop',
    ],
    category: 'corner',
    rating: 4.7,
    reviewCount: 64,
    isFeatured: true,
    isBestseller: false,
    isNew: false,
    inStock: true,
  },
  {
    id: '4',
    slug: 'float-suspended-70',
    name: 'FLOAT Suspended 70',
    shortDescription: 'Dramatic suspended profile for high-ceiling installations',
    price: 89.00,
    compareAtPrice: 110.00,
    images: [
      'https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop',
    ],
    category: 'suspended',
    rating: 5.0,
    reviewCount: 43,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    inStock: true,
  },
  {
    id: '5',
    slug: 'pure-trimless-28',
    name: 'PURE Trimless 28',
    shortDescription: 'Invisible integration — pure architectural light with no visible frame',
    price: 65.00,
    images: [
      'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop',
    ],
    category: 'trimless',
    rating: 4.9,
    reviewCount: 31,
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    inStock: true,
  },
  {
    id: '6',
    slug: 'cob-elite-strip-480',
    name: 'COB Elite Strip 480',
    shortDescription: 'Continuous filament-like 480 LED/m COB strip — zero hotspot',
    price: 28.50,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop',
    ],
    category: 'cob-strips',
    rating: 4.8,
    reviewCount: 156,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    inStock: true,
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Alessandro Marchetti',
    title: 'Principal Architect',
    company: 'Marchetti + Partners, Milan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=face',
    rating: 5,
    quote: 'The LUX Recessed series completely transformed our luxury villa project in Tuscany. The quality of light and the precision of the profiles exceeded every specification. Our clients were speechless.',
    project: 'Villa Luminara, Siena',
    featured: true,
  },
  {
    id: '2',
    name: 'Sarah Okonkwo',
    title: 'Interior Design Director',
    company: 'Studio Atlas, New York',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&crop=face',
    rating: 5,
    quote: 'We have specified LED Profile Decorations products on fourteen commercial projects this year. The consistency, the technical support, and the product quality are simply unmatched in the industry.',
    project: 'Corporate HQ, Financial District',
    featured: true,
  },
  {
    id: '3',
    name: 'David Lindqvist',
    title: 'Lighting Designer',
    company: 'Luminex Design Bureau, Stockholm',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop&crop=face',
    rating: 5,
    quote: 'The PURE Trimless range is what every serious lighting designer has been waiting for. True architectural integration with zero visible hardware. The IES files are accurate, the CRI is exceptional.',
    project: 'Scandic Boutique Hotel',
    featured: true,
  },
  {
    id: '4',
    name: 'Mei Zhang',
    title: 'Hospitality Design Lead',
    company: 'Zaha Group Asia, Shanghai',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop&crop=face',
    rating: 5,
    quote: 'For our 5-star resort in Sanya, we needed a lighting system that matched the architecture. The custom lengths, the perfect color consistency, and the on-time delivery made this project exceptional.',
    project: 'Peninsula Resort, Hainan',
    featured: true,
  },
]

export const GALLERY_PROJECTS: Partial<Project>[] = [
  {
    id: '1',
    slug: 'villa-minerva-amalfi',
    title: 'Villa Minerva',
    location: 'Amalfi Coast, Italy',
    category: 'residential',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=85&auto=format&fit=crop',
    featured: true,
  },
  {
    id: '2',
    slug: 'axiom-tower-dubai',
    title: 'Axiom Tower',
    location: 'Dubai, UAE',
    category: 'commercial',
    coverImage: 'https://images.unsplash.com/photo-1497366754035-f200586c6404?w=1200&q=85&auto=format&fit=crop',
    featured: true,
  },
  {
    id: '3',
    slug: 'maison-soir-paris',
    title: 'Maison du Soir',
    location: 'Paris, France',
    category: 'hospitality',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85&auto=format&fit=crop',
    featured: true,
  },
  {
    id: '4',
    slug: 'nakamura-flagship-tokyo',
    title: 'Nakamura Flagship',
    location: 'Ginza, Tokyo',
    category: 'retail',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85&auto=format&fit=crop',
    featured: false,
  },
  {
    id: '5',
    slug: 'helix-campus-sf',
    title: 'Helix Campus',
    location: 'San Francisco, USA',
    category: 'office',
    coverImage: 'https://images.unsplash.com/photo-1497366811915-b7f5a5b5a5b5?w=1200&q=85&auto=format&fit=crop',
    featured: false,
  },
  {
    id: '6',
    slug: 'botanic-garden-singapore',
    title: 'Botanic Garden Pavilion',
    location: 'Singapore',
    category: 'outdoor',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&auto=format&fit=crop',
    featured: false,
  },
]

export const BRANDS: Brand[] = [
  { id: '1', name: 'Philips Hue', logo: '/images/brands/philips.svg' },
  { id: '2', name: 'Osram', logo: '/images/brands/osram.svg' },
  { id: '3', name: 'Cree', logo: '/images/brands/cree.svg' },
  { id: '4', name: 'Meanwell', logo: '/images/brands/meanwell.svg' },
  { id: '5', name: 'Helvar', logo: '/images/brands/helvar.svg' },
  { id: '6', name: 'Lutron', logo: '/images/brands/lutron.svg' },
  { id: '7', name: 'DALI', logo: '/images/brands/dali.svg' },
  { id: '8', name: 'Legrand', logo: '/images/brands/legrand.svg' },
]

export const COLOR_TEMPS = ['2700K', '3000K', '4000K', '5000K', '6500K'] as const
export const VOLTAGES = ['12V', '24V', '48V'] as const
export const CRI_OPTIONS = [80, 90, 95] as const
export const FINISHES = ['Anodized Silver', 'Anodized Black', 'Matte White', 'Brushed Gold'] as const

export const FREE_SHIPPING_THRESHOLD = 500
export const TAX_RATE = 0.08
