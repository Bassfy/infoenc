'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName }),
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        toast.success('Account created successfully!');
        window.location.href = '/';
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-display font-light text-white tracking-widest uppercase mb-6">
            LED Profile
          </Link>
          <h1 className="text-3xl font-display font-light text-white">Create Account</h1>
          <p className="text-obsidian-500 mt-2">Join LED Profile Decorations</p>
        </div>

        <div className="bg-obsidian-100 border border-obsidian-300 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-obsidian-400 mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)} className="input-field w-full" placeholder="John" required />
              </div>
              <div>
                <label className="block text-sm text-obsidian-400 mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)} className="input-field w-full" placeholder="Doe" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-obsidian-400 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field w-full" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm text-obsidian-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="input-field w-full pr-10"
                  placeholder="Min. 8 characters"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-obsidian-400 mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className="input-field w-full" placeholder="Repeat password" required />
            </div>

            <p className="text-xs text-obsidian-500">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-electric hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-electric hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-obsidian-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-electric hover:text-electric-400 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
