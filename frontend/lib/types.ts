export interface Product {
  id: string
  slug: string
  name: string
  shortDescription: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: ProductCategory
  subcategory?: string
  tags: string[]
  sku: string
  inStock: boolean
  stockQuantity: number
  rating: number
  reviewCount: number
  specifications: ProductSpec[]
  dimensions: ProductDimensions
  materials: string[]
  finishes: Finish[]
  lengths: LengthOption[]
  installationMethod: string
  compatibleAccessories: string[]
  compatibleStrips: string[]
  downloads: ProductDownload[]
  warranty: string
  isFeatured: boolean
  isNew: boolean
  isBestseller: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductSpec {
  label: string
  value: string
}

export interface ProductDimensions {
  width: number
  height: number
  depth?: number
  unit: 'mm' | 'cm' | 'in'
}

export interface Finish {
  id: string
  name: string
  color: string
  image?: string
}

export interface LengthOption {
  value: number
  unit: 'mm' | 'cm' | 'm' | 'ft'
  price: number
  label: string
}

export interface ProductDownload {
  type: 'CAD' | 'IES' | 'PDF' | 'DXF'
  label: string
  url: string
  size: string
}

export type ProductCategory =
  | 'recessed'
  | 'surface-mounted'
  | 'corner'
  | 'suspended'
  | 'trimless'
  | 'flexible'
  | 'led-strips'
  | 'cob-strips'
  | 'drivers'
  | 'controllers'
  | 'power-supplies'
  | 'diffusers'
  | 'accessories'
  | 'connectors'
  | 'end-caps'
  | 'mounting-clips'

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  selectedLength?: LengthOption
  selectedFinish?: Finish
  configuration?: ConfigurationOptions
}

export interface ConfigurationOptions {
  profileType: string
  length: number
  color: string
  finish: string
  diffusion: string
  ledStripType: 'COB' | 'SMD'
  voltage: '12V' | '24V' | '48V'
  colorTemperature: '2700K' | '3000K' | '4000K' | '5000K' | '6500K'
  cri: 80 | 90 | 95
  driver: string
  connector: string
  mountingAccessories: string[]
  endCaps: string
  suspensionKit?: string
}

export interface WishlistItem {
  productId: string
  product: Product
  addedAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  body: string
  verified: boolean
  helpful: number
  images?: string[]
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingAddress: Address
  billingAddress: Address
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  configuration?: ConfigurationOptions
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'stripe' | 'paypal' | 'cod'

export interface Address {
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  role: 'customer' | 'admin' | 'manager'
  addresses: Address[]
  createdAt: string
}

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  location: string
  category: ProjectCategory
  images: string[]
  coverImage: string
  products: string[]
  completedAt: string
  featured: boolean
  details: ProjectDetail[]
}

export type ProjectCategory =
  | 'residential'
  | 'commercial'
  | 'retail'
  | 'hospitality'
  | 'office'
  | 'outdoor'

export interface ProjectDetail {
  label: string
  value: string
}

export interface Testimonial {
  id: string
  name: string
  title: string
  company: string
  avatar: string
  rating: number
  quote: string
  project?: string
  featured: boolean
}

export interface Brand {
  id: string
  name: string
  logo: string
  url?: string
}

export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount?: number
  maxUses?: number
  usedCount: number
  expiresAt?: string
  isActive: boolean
}

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  finish?: string
  voltage?: string
  colorTemp?: string
  inStock?: boolean
  rating?: number
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'bestselling'
}

export interface NavigationItem {
  label: string
  href: string
  children?: NavigationChild[]
  image?: string
  badge?: string
}

export interface NavigationChild {
  label: string
  href: string
  description?: string
  icon?: string
}

export interface SiteSettings {
  siteName: string
  tagline: string
  description: string
  logo: string
  favicon: string
  primaryColor: string
  accentColor: string
  currency: string
  languages: string[]
  defaultLanguage: string
  contactEmail: string
  contactPhone: string
  address: string
  socialLinks: SocialLink[]
  shippingThreshold: number
}

export interface SocialLink {
  platform: string
  url: string
  icon: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  pagination?: Pagination
}

export interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface DashboardStats {
  totalRevenue: number
  revenueGrowth: number
  totalOrders: number
  ordersGrowth: number
  totalCustomers: number
  customersGrowth: number
  averageOrderValue: number
  aovGrowth: number
  topProducts: TopProduct[]
  recentOrders: Order[]
  salesData: SalesDataPoint[]
}

export interface TopProduct {
  product: Product
  totalSold: number
  revenue: number
}

export interface SalesDataPoint {
  date: string
  revenue: number
  orders: number
}
