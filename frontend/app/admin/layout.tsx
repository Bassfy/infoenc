'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart3,
  Settings, LogOut, Menu, X, Image as ImageIcon, FileText, Star,
  Truck, RotateCcw, Percent, Bell, Globe, Palette,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Inventory', href: '/admin/inventory', icon: Package },
  { label: 'Coupons', href: '/admin/coupons', icon: Percent },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Shipping', href: '/admin/shipping', icon: Truck },
  { label: 'Returns', href: '/admin/returns', icon: RotateCcw },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'SEO', href: '/admin/seo', icon: Globe },
  { label: 'Appearance', href: '/admin/appearance', icon: Palette },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0d0d0d] border-r border-white/5 transition-all duration-300 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <div className="relative w-7 h-7 flex-shrink-0">
            <div className="absolute inset-0 border border-electric/60 rotate-45" />
            <div className="absolute inset-1.5 bg-electric/20 rotate-45" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="text-white text-xs font-medium tracking-widest uppercase block leading-none">
                LED Profile
              </span>
              <span className="text-electric text-[10px] tracking-[0.3em] uppercase">Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-xs tracking-wide transition-all duration-200 ${
                  active
                    ? 'text-white bg-white/6 border-r-2 border-electric'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/3'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 text-white/30 hover:text-white transition-colors duration-200 text-xs w-full"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-56' : 'ml-16'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium text-white tracking-wide">
              {navItems.find((n) => n.href === pathname)?.label || 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-white/40 hover:text-white relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-electric rounded-full" />
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-white/40 hover:text-white px-3 py-1.5 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              View Site
            </Link>
            <button className="flex items-center gap-2 text-xs text-white/40 hover:text-red-400 transition-colors duration-200 px-3 py-1.5">
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
