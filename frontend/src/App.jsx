import { useEffect, useMemo, useState } from 'react';
import ProductCard from './components/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('');
  const [showBag, setShowBag] = useState(false);
  const [email, setEmail] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products`).then((response) => response.json()).then(setProducts).catch(() => setStatus('The catalogue is resting. Please try again.'));
  }, []);

  const categories = ['All', ...new Set(products.map((product) => product.category))];
  const visibleProducts = category === 'All' ? products : products.filter((product) => product.category === category);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
    });
    setStatus(`${product.name} added to your bag.`);
  }

  async function checkout() {
    if (!cart.length) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }) });
      if (!response.ok) throw new Error('Order request failed');
      const order = await response.json();
      setCart([]);
      setEmail('');
      setShowBag(false);
      setOrderConfirmation(order);
    } catch {
      setStatus('We could not place that order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return <div className="app">
    <header className="topbar"><a className="wordmark" href="/">COMMON GROUND<span>.</span></a><nav><a href="#shop">Shop</a><a href="#story">Our point of view</a></nav><button className="bag" onClick={() => setShowBag(true)}>Bag ({cartCount})</button></header>
    {orderConfirmation && <div className="order-confirmation" role="status"><div><p className="eyebrow">Order confirmed</p><h2>Thank you for choosing well.</h2><p>Order #{orderConfirmation.id} has been received for ${orderConfirmation.total.toFixed(2)}.</p><small>Email delivery is available when SMTP is configured.</small></div><button aria-label="Dismiss order confirmation" onClick={() => setOrderConfirmation(null)}>×</button></div>}
    {showBag && <aside className="bag-panel" aria-label="Shopping bag"><div className="bag-heading"><div><p className="eyebrow">Your selection</p><h2>Shopping bag</h2></div><button className="close-bag" aria-label="Close shopping bag" onClick={() => setShowBag(false)}>×</button></div>{cart.length ? <><div className="bag-items">{cart.map((item) => <div className="bag-item" key={item.id}><img src={item.imageUrl} alt="" /><div><h3>{item.name}</h3><p>{item.quantity} × ${item.price.toFixed(2)}</p></div><strong>${(item.price * item.quantity).toFixed(2)}</strong></div>)}</div><div className="bag-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div><form className="checkout-form" onSubmit={(event) => { event.preventDefault(); checkout(); }}><label htmlFor="order-email">Email for your order</label><input id="order-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /><button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Placing order...' : 'Place order'}</button></form></> : <p className="empty-bag">Your bag is waiting for something considered.</p>}</aside>}
    <main>
      <section className="hero"><p className="eyebrow">Objects with a longer life</p><h1>Make room<br /><em>for better.</em></h1><p className="hero-copy">A small collection of useful, beautiful things for the everyday rituals that make a home.</p><a className="text-link" href="#shop">Explore the collection <span>↘</span></a></section>
      <section className="shop" id="shop"><div className="section-heading"><div><p className="eyebrow">The edit / 01</p><h2>Good things, thoughtfully chosen.</h2></div><div className="filters">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div><div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div></section>
      <section className="story" id="story"><p className="eyebrow">A considered approach</p><h2>Less, but better held.</h2><p>We look for honest materials, quiet forms, and makers who care about the details that reveal themselves over time.</p></section>
    </main>
    <footer><span>COMMON GROUND</span><span>{status || `Your bag total: $${total.toFixed(2)}`}</span><span>© 2026 Abdullah Faisal. All rights reserved.</span></footer>
  </div>;
}

export default App;
