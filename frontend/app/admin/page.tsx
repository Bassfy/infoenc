'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign,
  Package, ArrowRight, ExternalLink, MoreHorizontal,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

const revenueData = [
  { date: 'Jan', revenue: 42000, orders: 87 },
  { date: 'Feb', revenue: 38000, orders: 74 },
  { date: 'Mar', revenue: 56000, orders: 112 },
  { date: 'Apr', revenue: 61000, orders: 128 },
  { date: 'May', revenue: 58000, orders: 118 },
  { date: 'Jun', revenue: 72000, orders: 145 },
  { date: 'Jul', revenue: 69000, orders: 138 },
  { date: 'Aug', revenue: 84000, orders: 162 },
  { date: 'Sep', revenue: 91000, orders: 178 },
  { date: 'Oct', revenue: 88000, orders: 171 },
  { date: 'Nov', revenue: 107000, orders: 213 },
  { date: 'Dec', revenue: 124000, orders: 247 },
]

const topProducts = [
  { name: 'LUX Recessed 35 Slim', sku: 'LUX-R35S', sold: 1847, revenue: 90310, stock: 247 },
  { name: 'COB Elite Strip 480', sku: 'COB-E480', sold: 2341, revenue: 66718, stock: 583 },
  { name: 'ARC Surface Pro 50', sku: 'ARC-SP50', sold: 1103, revenue: 40259, stock: 189 },
  { name: 'FLOAT Suspended 70', sku: 'FLT-S70', sold: 432, revenue: 38448, stock: 64 },
  { name: 'PURE Trimless 28', sku: 'PUR-T28', sold: 567, revenue: 36855, stock: 98 },
]

const recentOrders = [
  { id: '#LPD-2024-1247', customer: 'Alessandro M.', total: 3420, status: 'delivered', date: 'Today, 09:23' },
  { id: '#LPD-2024-1246', customer: 'Sarah O.', total: 1870, status: 'shipped', date: 'Today, 08:15' },
  { id: '#LPD-2024-1245', customer: 'David L.', total: 6240, status: 'processing', date: 'Yesterday' },
  { id: '#LPD-2024-1244', customer: 'Mei Z.', total: 12800, status: 'confirmed', date: 'Yesterday' },
  { id: '#LPD-2024-1243', customer: 'Lars H.', total: 940, status: 'delivered', date: '2 days ago' },
]

const statusColors: Record<string, string> = {
  delivered: 'text-green-400 bg-green-400/10',
  shipped: 'text-electric bg-electric/10',
  processing: 'text-gold bg-gold/10',
  confirmed: 'text-white/60 bg-white/5',
  pending: 'text-white/30 bg-white/5',
}

const statCards = [
  {
    label: 'Total Revenue',
    value: formatPrice(890000),
    change: '+18.2%',
    positive: true,
    icon: DollarSign,
    sub: 'vs last year',
  },
  {
    label: 'Total Orders',
    value: '1,573',
    change: '+12.4%',
    positive: true,
    icon: ShoppingBag,
    sub: 'vs last year',
  },
  {
    label: 'Active Customers',
    value: '4,218',
    change: '+24.7%',
    positive: true,
    icon: Users,
    sub: 'registered accounts',
  },
  {
    label: 'Avg Order Value',
    value: formatPrice(565),
    change: '-3.1%',
    positive: false,
    icon: TrendingUp,
    sub: 'vs last year',
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass border border-white/10 p-3">
        <p className="text-xs text-white/60 mb-1">{label}</p>
        <p className="text-sm text-white font-medium">{formatPrice(payload[0].value)}</p>
        {payload[1] && (
          <p className="text-xs text-electric">{payload[1].value} orders</p>
        )}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [chartPeriod, setChartPeriod] = useState('12M')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-[#181818] border border-white/10 px-3 py-2 text-xs text-white/60 outline-none">
            <option>Last 12 months</option>
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>This year</option>
          </select>
          <Link href="/shop" target="_blank" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 px-3 py-2 transition-colors duration-200">
            <ExternalLink className="w-3 h-3" />
            View Store
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#181818] border border-white/5 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 bg-white/4 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-electric" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    card.positive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-light text-white mb-1">{card.value}</p>
              <p className="text-xs text-white/30">{card.label}</p>
              <p className="text-[10px] text-white/20 mt-0.5">{card.sub}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#181818] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-white">Revenue Overview</h2>
          <div className="flex items-center gap-1">
            {['7D', '30D', '3M', '12M'].map((period) => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1.5 text-xs transition-all duration-200 ${
                  chartPeriod === period
                    ? 'bg-electric/15 text-electric'
                    : 'text-white/30 hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00AEEF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00AEEF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#00AEEF" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-[#181818] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-white">Top Products</h2>
            <Link href="/admin/products" className="text-xs text-electric flex items-center gap-1 hover:text-white transition-colors duration-200">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.sku} className="flex items-center gap-3">
                <span className="text-xs text-white/20 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{product.name}</p>
                  <p className="text-[10px] text-white/30">{product.sku} • {product.sold} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white">{formatPrice(product.revenue)}</p>
                  <p className={`text-[10px] ${product.stock < 100 ? 'text-gold' : 'text-white/30'}`}>
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#181818] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-electric flex items-center gap-1 hover:text-white transition-colors duration-200">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium">{order.id}</p>
                  <p className="text-[10px] text-white/30">{order.customer} · {order.date}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 uppercase tracking-widest font-medium ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>
                <span className="text-xs text-white ml-2">{formatPrice(order.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-[#181818] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-white">Orders Volume</h2>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="orders" fill="rgba(0, 174, 239, 0.4)" stroke="#00AEEF" strokeWidth={1} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
