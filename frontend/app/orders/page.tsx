'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-electric', bg: 'bg-electric/10', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Package },
  shipped: { label: 'Shipped', color: 'text-purple-400', bg: 'bg-purple-400/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

export default function OrdersPage() {
  const [trackInput, setTrackInput] = useState('');

  return (
    <div className="min-h-screen bg-obsidian pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-display font-light text-white">Order Tracking</h1>
          <p className="text-obsidian-500 mt-2">Track the status of your orders</p>
        </motion.div>

        {/* Track by order number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-obsidian-100 border border-obsidian-300 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-display font-light text-white mb-4">Track Your Order</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter order number (e.g. LPD-ABC123)"
              value={trackInput}
              onChange={e => setTrackInput(e.target.value)}
              className="input-field flex-1"
            />
            <button className="btn-primary flex items-center gap-2 px-6">
              <Search className="w-4 h-4" /> Track
            </button>
          </div>
        </motion.div>

        {/* Status legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-obsidian-100 border border-obsidian-300 rounded-2xl p-6"
        >
          <h2 className="text-lg font-display font-light text-white mb-5">Order Status Guide</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className="text-obsidian-400 text-sm">{config.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-obsidian-300 flex items-center justify-between">
            <p className="text-obsidian-500 text-sm">Need help with your order?</p>
            <Link href="/contact" className="text-electric hover:text-electric-400 transition-colors text-sm flex items-center gap-1">
              Contact Support <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Sign in prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <p className="text-obsidian-500 text-sm">
            Have an account?{' '}
            <Link href="/auth/login" className="text-electric hover:text-electric-400 transition-colors">
              Sign in
            </Link>{' '}
            to see all your orders.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
