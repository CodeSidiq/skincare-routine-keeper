import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import { loadProducts, saveProducts } from './lib/storage';
import type { RoutineSlot, SkincareProduct } from './types/product';

type ProductFormState = {
  name: string;
  brand: string;
  concern: string;
  routine: RoutineSlot;
  active: boolean;
};

const initialForm: ProductFormState = {
  name: '',
  brand: '',
  concern: '',
  routine: 'morning',
  active: true,
};

const concernSuggestions = [
  'Hydration',
  'Acne',
  'SPF',
  'Anti-aging',
  'Brightening',
  'Redness',
  'Barrier repair',
];

function App() {
  const [products, setProducts] = useState<SkincareProduct[]>(loadProducts);
  const [form, setForm] = useState<ProductFormState>(initialForm);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const morningProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.routine === 'morning' || product.routine === 'both',
      ),
    [products],
  );

  const eveningProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.routine === 'evening' || product.routine === 'both',
      ),
    [products],
  );

  const activeCount = products.filter((product) => product.active).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const brand = form.brand.trim();
    const concern = form.concern.trim();

    if (!name || !brand || !concern) {
      return;
    }

    const product: SkincareProduct = {
      id: crypto.randomUUID(),
      name,
      brand,
      concern,
      routine: form.routine,
      active: form.active,
    };

    setProducts((current) => [product, ...current]);
    setForm(initialForm);
  }

  function toggleProduct(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, active: !product.active }
          : product,
      ),
    );
  }

  function deleteProduct(id: string) {
    setProducts((current) =>
      current.filter((product) => product.id !== id),
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">YOUR DAILY SHELF</p>
          <h1>Skincare, kept simple.</h1>
          <p className="hero-description">
            Keep every product in its place and remember exactly when it belongs
            in your routine.
          </p>
        </div>

        <div className="routine-summary" aria-label="Routine summary">
          <span>
            <strong>{products.length}</strong>
            products
          </span>
          <span>
            <strong>{activeCount}</strong>
            active
          </span>
        </div>
      </header>

      <section className="content-grid">
        <aside className="form-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ADD TO YOUR SHELF</p>
              <h2>New product</h2>
            </div>
            <span className="bottle-icon" aria-hidden="true">
              ◇
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Product name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Barrier Cream"
              />
            </label>

            <label>
              Brand
              <input
                required
                value={form.brand}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    brand: event.target.value,
                  }))
                }
                placeholder="e.g. Skin Lab"
              />
            </label>

            <label>
              Skin concern
              <input
                required
                list="concerns"
                value={form.concern}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    concern: event.target.value,
                  }))
                }
                placeholder="What does it target?"
              />
              <datalist id="concerns">
                {concernSuggestions.map((concern) => (
                  <option key={concern} value={concern} />
                ))}
              </datalist>
            </label>

            <fieldset>
              <legend>Routine slot</legend>
              <div className="segmented-control">
                {(['morning', 'evening', 'both'] as RoutineSlot[]).map(
                  (slot) => (
                    <button
                      type="button"
                      key={slot}
                      aria-pressed={form.routine === slot}
                      className={form.routine === slot ? 'selected' : ''}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          routine: slot,
                        }))
                      }
                    >
                      {slot === 'morning'
                        ? 'Morning'
                        : slot === 'evening'
                          ? 'Evening'
                          : 'Both'}
                    </button>
                  ),
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend>Current status</legend>
              <div className="status-options">
                <label className="status-option">
                  <input
                    type="radio"
                    name="status"
                    checked={form.active}
                    onChange={() =>
                      setForm((current) => ({ ...current, active: true }))
                    }
                  />
                  <span>Active</span>
                </label>

                <label className="status-option">
                  <input
                    type="radio"
                    name="status"
                    checked={!form.active}
                    onChange={() =>
                      setForm((current) => ({ ...current, active: false }))
                    }
                  />
                  <span>Paused</span>
                </label>
              </div>
            </fieldset>

            <button className="primary-button" type="submit">
              Add to routine
              <span aria-hidden="true">＋</span>
            </button>
          </form>
        </aside>

        <section className="shelf-area">
          <RoutineSection
            title="Morning"
            subtitle="Start fresh"
            symbol="☼"
            products={morningProducts}
            onToggle={toggleProduct}
            onDelete={deleteProduct}
          />

          <RoutineSection
            title="Evening"
            subtitle="Wind down"
            symbol="☾"
            products={eveningProducts}
            onToggle={toggleProduct}
            onDelete={deleteProduct}
          />
        </section>
      </section>
    </main>
  );
}

type RoutineSectionProps = {
  title: string;
  subtitle: string;
  symbol: string;
  products: SkincareProduct[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function RoutineSection({
  title,
  subtitle,
  symbol,
  products,
  onToggle,
  onDelete,
}: RoutineSectionProps) {
  return (
    <section className="routine-section">
      <div className="routine-header">
        <div className="routine-title">
          <span className="routine-symbol" aria-hidden="true">
            {symbol}
          </span>
          <div>
            <p>{subtitle}</p>
            <h2>{title}</h2>
          </div>
        </div>

        <span className="product-count">
          {products.length} {products.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="empty-shelf">
          <span aria-hidden="true">✦</span>
          <h3>Your shelf is clear</h3>
          <p>Add a product for your {title.toLowerCase()} routine.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={`${title}-${product.id}`}
              product={product}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type ProductCardProps = {
  product: SkincareProduct;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function ProductCard({
  product,
  onToggle,
  onDelete,
}: ProductCardProps) {
  return (
    <article className={`product-card ${product.active ? '' : 'paused'}`}>
      <div className="product-topline">
        <span
          className={`status-badge ${product.active ? 'active' : 'inactive'}`}
        >
          <span aria-hidden="true">●</span>
          {product.active ? 'Active' : 'Paused'}
        </span>

        {product.routine === 'both' && (
          <span className="both-badge">AM + PM</span>
        )}
      </div>

      <div className="product-info">
        <p className="brand">{product.brand}</p>
        <h3>{product.name}</h3>
        <span className="concern-tag">{product.concern}</span>
      </div>

      <div className="card-actions">
        <button
          className="toggle-button"
          type="button"
          onClick={() => onToggle(product.id)}
          aria-label={`${product.active ? 'Pause' : 'Activate'} ${product.name}`}
        >
          {product.active ? 'Pause' : 'Activate'}
        </button>

        <button
          className="delete-button"
          type="button"
          onClick={() => onDelete(product.id)}
          aria-label={`Delete ${product.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default App;
