'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ChevronDown, Lock, CreditCard, Truck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'information' | 'shipping' | 'payment' | 'confirmation';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  shippingMethod: 'standard' | 'express' | 'overnight';
  paymentMethod: 'stripe' | 'paypal' | 'cod';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  notes: string;
}

const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Shipping', description: '5–10 business days', price: 0, freeOver: 500 },
  { id: 'express', label: 'Express Shipping', description: '2–3 business days', price: 29.90 },
  { id: 'overnight', label: 'Overnight Delivery', description: 'Next business day', price: 59.90 },
];

const STEPS: { id: Step; label: string }[] = [
  { id: 'information', label: 'Information' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
];

export default function CheckoutPage() {
  const { items, getTotal, couponCode, discount, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>('information');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [form, setForm] = useState<FormData>({
    email: '', firstName: '', lastName: '', company: '',
    address: '', city: '', state: '', postalCode: '', country: 'US', phone: '',
    shippingMethod: 'standard', paymentMethod: 'stripe',
    cardNumber: '', cardExpiry: '', cardCvc: '', cardName: '', notes: '',
  });

  const subtotal = getTotal();
  const selectedShipping = SHIPPING_OPTIONS.find(o => o.id === form.shippingMethod)!;
  const shippingCost = selectedShipping.freeOver && subtotal >= selectedShipping.freeOver ? 0 : selectedShipping.price;
  const taxAmount = subtotal * 0.08;
  const orderTotal = subtotal + shippingCost + taxAmount;

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1800));
      const num = `LPD-${Date.now().toString(36).toUpperCase()}`;
      setOrderNumber(num);
      clearCart();
      setStep('confirmation');
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = STEPS.findIndex(s => s.id === step);

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-obsidian pt-32 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto px-4"
        >
          <div className="w-20 h-20 rounded-full bg-electric/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-electric" />
          </div>
          <h1 className="text-4xl font-display font-light text-white mb-3">Order Confirmed</h1>
          <p className="text-obsidian-400 mb-2">Thank you for your order!</p>
          <p className="text-obsidian-500 text-sm mb-8">
            Order <span className="text-electric font-mono">{orderNumber}</span> has been placed successfully.
            A confirmation email will be sent to <span className="text-white">{form.email}</span>.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
            <Link href="/" className="btn-primary">Back to Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-obsidian pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-display font-light text-white mb-4">Your cart is empty</h1>
          <Link href="/shop" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 mb-6 border-b border-obsidian-300 flex items-center justify-between">
          <Link href="/" className="text-xl font-display text-white tracking-widest uppercase">
            LED Profile
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                {i > 0 && <ChevronDown className="w-4 h-4 text-obsidian-500 -rotate-90" />}
                <button
                  onClick={() => i < stepIndex && setStep(s.id)}
                  className={`transition-colors ${i === stepIndex ? 'text-white font-medium' : i < stepIndex ? 'text-electric hover:text-electric-400 cursor-pointer' : 'text-obsidian-500 cursor-default'}`}
                >
                  {s.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {step === 'information' && (
                <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-display font-light text-white mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <input type="email" placeholder="Email address *" value={form.email} onChange={e => update('email', e.target.value)} className="input-field w-full" required />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First name *" value={form.firstName} onChange={e => update('firstName', e.target.value)} className="input-field" required />
                      <input type="text" placeholder="Last name *" value={form.lastName} onChange={e => update('lastName', e.target.value)} className="input-field" required />
                    </div>
                    <input type="text" placeholder="Company (optional)" value={form.company} onChange={e => update('company', e.target.value)} className="input-field w-full" />

                    <h3 className="text-lg font-display font-light text-white pt-2">Shipping Address</h3>
                    <input type="text" placeholder="Address *" value={form.address} onChange={e => update('address', e.target.value)} className="input-field w-full" required />
                    <div className="grid grid-cols-3 gap-4">
                      <input type="text" placeholder="City *" value={form.city} onChange={e => update('city', e.target.value)} className="input-field col-span-1" required />
                      <input type="text" placeholder="State" value={form.state} onChange={e => update('state', e.target.value)} className="input-field" />
                      <input type="text" placeholder="ZIP *" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} className="input-field" required />
                    </div>
                    <input type="tel" placeholder="Phone (optional)" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field w-full" />
                    <textarea placeholder="Order notes (optional)" value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} className="input-field w-full resize-none" />
                  </div>
                  <button
                    onClick={() => setStep('shipping')}
                    disabled={!form.email || !form.firstName || !form.lastName || !form.address || !form.city || !form.postalCode}
                    className="btn-primary mt-6 w-full disabled:opacity-50"
                  >
                    Continue to Shipping
                  </button>
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-display font-light text-white mb-6">Shipping Method</h2>
                  <div className="space-y-3">
                    {SHIPPING_OPTIONS.map(option => {
                      const price = option.freeOver && subtotal >= option.freeOver ? 0 : option.price;
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${form.shippingMethod === option.id ? 'border-electric bg-electric/10' : 'border-obsidian-300 bg-obsidian-100 hover:border-obsidian-400'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input type="radio" name="shipping" value={option.id} checked={form.shippingMethod === option.id} onChange={() => update('shippingMethod', option.id)} className="accent-electric" />
                            <Truck className="w-5 h-5 text-obsidian-400" />
                            <div>
                              <p className="text-white font-medium text-sm">{option.label}</p>
                              <p className="text-obsidian-500 text-xs">{option.description}</p>
                            </div>
                          </div>
                          <span className={price === 0 ? 'text-electric font-medium' : 'text-white'}>
                            {price === 0 ? 'Free' : formatPrice(price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep('information')} className="btn-secondary flex-1">Back</button>
                    <button onClick={() => setStep('payment')} className="btn-primary flex-1">Continue to Payment</button>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-display font-light text-white mb-6">Payment</h2>

                  {/* Payment method selector */}
                  <div className="flex gap-2 mb-6">
                    {[
                      { id: 'stripe', label: 'Credit Card' },
                      { id: 'paypal', label: 'PayPal' },
                      { id: 'cod', label: 'Cash on Delivery' },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => update('paymentMethod', method.id)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${form.paymentMethod === method.id ? 'bg-electric text-obsidian' : 'bg-obsidian-200 text-obsidian-400 hover:text-white'}`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {form.paymentMethod === 'stripe' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-obsidian-400 text-xs mb-4">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Your card information is encrypted and secure</span>
                      </div>
                      <input type="text" placeholder="Card number" value={form.cardNumber} onChange={e => update('cardNumber', e.target.value.replace(/\D/g, '').slice(0, 16))} className="input-field w-full" />
                      <input type="text" placeholder="Name on card" value={form.cardName} onChange={e => update('cardName', e.target.value)} className="input-field w-full" />
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM / YY" value={form.cardExpiry} onChange={e => update('cardExpiry', e.target.value)} className="input-field" />
                        <input type="text" placeholder="CVC" value={form.cardCvc} onChange={e => update('cardCvc', e.target.value.slice(0, 4))} className="input-field" />
                      </div>
                    </div>
                  )}

                  {form.paymentMethod === 'paypal' && (
                    <div className="bg-obsidian-200 rounded-xl p-8 text-center">
                      <CreditCard className="w-12 h-12 text-[#003087] mx-auto mb-3" />
                      <p className="text-obsidian-400 text-sm">You will be redirected to PayPal to complete your payment after placing the order.</p>
                    </div>
                  )}

                  {form.paymentMethod === 'cod' && (
                    <div className="bg-obsidian-200 rounded-xl p-8 text-center">
                      <Truck className="w-12 h-12 text-gold mx-auto mb-3" />
                      <p className="text-obsidian-400 text-sm">Pay with cash when your order is delivered. COD available in select regions.</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep('shipping')} className="btn-secondary flex-1">Back</button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading || (form.paymentMethod === 'stripe' && (!form.cardNumber || !form.cardExpiry || !form.cardCvc))}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" /> Processing...</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Place Order — {formatPrice(orderTotal)}</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-obsidian-100 border border-obsidian-300 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-display font-light text-white mb-5">Order Summary</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-obsidian-200 flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-electric text-obsidian text-xs rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm line-clamp-1">{item.name}</p>
                      {item.selectedFinish && <p className="text-obsidian-500 text-xs">{item.selectedFinish}</p>}
                    </div>
                    <span className="text-white text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-obsidian-300 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-obsidian-400">
                  <span>Subtotal</span><span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-electric">
                    <span>Discount ({couponCode})</span><span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-obsidian-400">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-electric' : 'text-white'}>
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-obsidian-400">
                  <span>Tax (8%)</span><span className="text-white">{formatPrice(taxAmount)}</span>
                </div>
                <div className="border-t border-obsidian-300 pt-3 flex justify-between text-white font-semibold">
                  <span>Total</span><span>{formatPrice(orderTotal)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4 text-xs text-obsidian-500 justify-center">
                <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> SSL Secure</div>
                <div className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Encrypted</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
