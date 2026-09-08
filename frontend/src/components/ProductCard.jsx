export default function ProductCard({ product, onAdd }) {
  return (
    <article className="product">
      <div className="product-image">
        <img src={product.imageUrl} alt={product.name} />
        <button aria-label={`Add ${product.name} to bag`} onClick={() => onAdd(product)}>+</button>
      </div>
      <div className="product-meta">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        <strong>${product.price.toFixed(2)}</strong>
      </div>
    </article>
  );
}
