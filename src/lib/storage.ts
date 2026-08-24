import type { SkincareProduct } from '../types/product';

export const STORAGE_KEY = 'skincare-routine-products';

export function loadProducts(): SkincareProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidProduct);
  } catch {
    return [];
  }
}

export function saveProducts(products: SkincareProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // The app remains usable even if browser storage is unavailable.
  }
}

function isValidProduct(value: unknown): value is SkincareProduct {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const product = value as Record<string, unknown>;

  return (
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.brand === 'string' &&
    typeof product.concern === 'string' &&
    (product.routine === 'morning' ||
      product.routine === 'evening' ||
      product.routine === 'both') &&
    typeof product.active === 'boolean'
  );
}
