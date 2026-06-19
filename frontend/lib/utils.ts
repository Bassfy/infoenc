import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+\S*$/, '…')
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

export function calculateWattage(lengthInMeters: number, wattsPerMeter: number): number {
  return Math.ceil(lengthInMeters * wattsPerMeter * 1.2)
}

export function recommendPowerSupply(wattage: number): string {
  if (wattage <= 30) return '30W Power Supply'
  if (wattage <= 60) return '60W Power Supply'
  if (wattage <= 100) return '100W Power Supply'
  if (wattage <= 150) return '150W Power Supply'
  if (wattage <= 200) return '200W Power Supply'
  if (wattage <= 320) return '320W Power Supply'
  return 'Custom Solution Required'
}

export function estimateLumens(wattsPerMeter: number, efficacy = 120): number {
  return Math.round(wattsPerMeter * efficacy)
}

export function getDiscountPercentage(price: number, compareAtPrice: number): number {
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    return { ...groups, [group]: [...(groups[group] || []), item] }
  }, {} as Record<string, T[]>)
}

export function generateOrderNumber(): string {
  const prefix = 'LPD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function parseColorTemp(temp: string): number {
  return parseInt(temp.replace('K', ''), 10)
}

export function getColorTempLabel(temp: string): string {
  const kelvin = parseColorTemp(temp)
  if (kelvin <= 2700) return 'Warm White'
  if (kelvin <= 3000) return 'Soft White'
  if (kelvin <= 4000) return 'Neutral White'
  if (kelvin <= 5000) return 'Cool White'
  return 'Daylight'
}

export function shimmerGradient(w: number, h: number) {
  return `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#181818" offset="20%" />
          <stop stop-color="#282828" offset="50%" />
          <stop stop-color="#181818" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#181818" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
    </svg>
  `
}

export function toBase64(str: string) {
  return typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)
}
