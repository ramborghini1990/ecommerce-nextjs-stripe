'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ShoppingCart, CheckCircle, ShieldCheck } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setProducts(data);
    }
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => sum + Number(item.price), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-16">
      {/* هدر سایت */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">TechGear Store</h1>
        <div className="flex items-center gap-2 font-medium bg-neutral-100 px-3 py-1.5 rounded-full text-sm">
          <ShoppingCart className="w-4 h-4" />
          <span>{cart.length} items</span>
          <span className="text-neutral-400">|</span>
          <span className="text-neutral-900 font-semibold">${totalAmount.toFixed(2)}</span>
        </div>
      </header>

      {/* کاتالوگ و سبد خرید */}
      <main className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* لیست محصولات */}
        <section className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Catalog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col justify-between">
                <img src={product.image_url} alt={product.name} className="h-48 w-full object-cover" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-800">{product.name}</h3>
                    <p className="text-sm text-neutral-500 mt-1">{product.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">${product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* سایدبار سبد خرید */}
        <aside className="bg-white border border-neutral-200 rounded-xl p-5 h-fit sticky top-24">
          <h2 className="font-semibold text-lg border-b pb-3 mb-4">Order Summary</h2>
          {cart.length === 0 ? (
            <p className="text-neutral-400 text-sm py-4">Your cart is empty.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span className="font-medium">${item.price}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-neutral-200 mt-4 pt-4 flex justify-between font-bold">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck className="w-5 h-5" />
            {loading ? 'Redirecting...' : 'Secure Checkout (Stripe)'}
          </button>

          {cart.length > 0 && (
            <button onClick={clearCart} className="w-full text-center text-xs text-neutral-400 hover:text-red-500 mt-3">
              Clear Cart
            </button>
          )}
        </aside>
      </main>
    </div>
  );
}