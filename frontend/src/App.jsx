import { useEffect, useMemo, useState } from 'react';
import ProductCard from './components/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('');

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
    const email = window.prompt('Email for your order confirmation:');
    if (!email) return;
    const response = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }) });
    if (response.ok) { setCart([]); setStatus('Order received. Thank you for choosing well.'); }
    else setStatus('We could not place that order. Please check your details.');
  }

  return <div className="app">
    <header className="topbar"><a className="wordmark" href="/">COMMON GROUND<span>.</span></a><nav><a href="#shop">Shop</a><a href="#story">Our point of view</a></nav><button className="bag" onClick={checkout}>Bag ({cartCount})</button></header>
    <main>
      <section className="hero"><p className="eyebrow">Objects with a longer life</p><h1>Make room<br /><em>for better.</em></h1><p className="hero-copy">A small collection of useful, beautiful things for the everyday rituals that make a home.</p><a className="text-link" href="#shop">Explore the collection <span>↘</span></a></section>
      <section className="shop" id="shop"><div className="section-heading"><div><p className="eyebrow">The edit / 01</p><h2>Good things, thoughtfully chosen.</h2></div><div className="filters">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div><div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div></section>
      <section className="story" id="story"><p className="eyebrow">A considered approach</p><h2>Less, but better held.</h2><p>We look for honest materials, quiet forms, and makers who care about the details that reveal themselves over time.</p></section>
    </main>
    <footer><span>COMMON GROUND</span><span>{status || `Your bag total: $${total.toFixed(2)}`}</span><span>© 2026</span></footer>
  </div>;
}

export default App;
