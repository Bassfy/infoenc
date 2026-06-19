export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  description: string;
  longDescription: string;
  features: string[];
  specs: ProductSpec[];
  images: string[];
  modelUrl?: string;
  price?: string;
  lumens?: number;
  wattage?: number;
  colorTemp?: string;
  cri?: number;
  ipRating?: string;
  dimensions?: string;
  finish?: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  tags: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export type ProductCategory =
  | "interior"
  | "exterior"
  | "commercial"
  | "smart"
  | "track"
  | "recessed"
  | "surface"
  | "pendant"
  | "wall"
  | "landscape";

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  productCount: number;
  category: ProductCategory;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  location: string;
  year: number;
  category: ProjectCategory;
  description: string;
  images: string[];
  coverImage: string;
  products: string[];
  tags: string[];
  size?: string;
}

export type ProjectCategory =
  | "hospitality"
  | "commercial"
  | "residential"
  | "retail"
  | "healthcare"
  | "education"
  | "outdoor"
  | "museum";

export interface Stat {
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
  description: string;
}

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

export interface MegaMenuCategory {
  title: string;
  href: string;
  items: NavItem[];
  featured?: {
    title: string;
    description: string;
    href: string;
    image: string;
  };
}

export interface TechFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  detail: string;
  metric?: string;
  metricLabel?: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType: string;
  message: string;
  budget?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface ScrollProgress {
  progress: number;
  direction: "up" | "down";
  velocity: number;
}
