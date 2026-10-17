import type { CartItem, MenuItem } from '../types/cafe';

export interface AuthoritativePriceResult {
  basePrice: number;
  customizationTotal: number;
  unitPrice: number;
  totalPrice: number;
  details: string[];
}

/**
 * Authoritative price calculator.
 * Ensures client-side price tampering is impossible by strictly computing
 * price rules against catalog data.
 */
export function calculateAuthoritativeItemPrice(
  menuItem: MenuItem,
  item: {
    size?: string;
    milk?: string;
    sweetness?: string;
    extraShot?: boolean;
    quantity: number;
  }
): AuthoritativePriceResult {
  const basePrice = menuItem.price;
  let customizationTotal = 0;
  const details: string[] = [`₱${basePrice} base`];

  // Size option calculation
  if (item.size && menuItem.options?.sizes) {
    const sizeOpt = menuItem.options.sizes.find(s => s.name.toLowerCase() === item.size?.toLowerCase());
    if (sizeOpt && sizeOpt.price > 0) {
      customizationTotal += sizeOpt.price;
      details.push(`+ ₱${sizeOpt.price} ${sizeOpt.name.toLowerCase()}`);
    }
  }

  // Milk option calculation
  if (item.milk && menuItem.options?.milks) {
    const milkOpt = menuItem.options.milks.find(m => m.name.toLowerCase() === item.milk?.toLowerCase());
    if (milkOpt && milkOpt.price > 0) {
      customizationTotal += milkOpt.price;
      details.push(`+ ₱${milkOpt.price} ${milkOpt.name.toLowerCase()}`);
    }
  }

  // Extra shot calculation
  if (item.extraShot) {
    const shotPrice = menuItem.options?.extraShotPrice ?? 30;
    customizationTotal += shotPrice;
    details.push(`+ ₱${shotPrice} extra shot`);
  }

  const unitPrice = basePrice + customizationTotal;
  const quantity = Math.max(1, Math.floor(item.quantity));
  const totalPrice = unitPrice * quantity;

  return {
    basePrice,
    customizationTotal,
    unitPrice,
    totalPrice,
    details,
  };
}

/**
 * Computes authoritative order totals from an array of cart items against trusted menu data.
 */
export function calculateAuthoritativeOrderTotal(
  cartItems: CartItem[],
  menuCatalog: MenuItem[]
): {
  subtotal: number;
  totalAmount: number;
  verifiedItems: CartItem[];
} {
  let subtotal = 0;
  const verifiedItems: CartItem[] = [];

  for (const item of cartItems) {
    const catalogItem = menuCatalog.find(m => m.id === item.menuItemId || m.name.toLowerCase() === item.name.toLowerCase());
    if (!catalogItem) {
      throw new Error(`Product ${item.name} is not found in the current active menu catalog.`);
    }

    if (!catalogItem.isAvailable) {
      throw new Error(`Product ${catalogItem.name} is currently sold out.`);
    }

    const priceResult = calculateAuthoritativeItemPrice(catalogItem, {
      size: item.size,
      milk: item.milk,
      extraShot: item.extraShot,
      quantity: item.quantity,
    });

    subtotal += priceResult.totalPrice;
    verifiedItems.push({
      ...item,
      price: priceResult.unitPrice,
      basePrice: priceResult.basePrice,
      quantity: Math.max(1, item.quantity),
    });
  }

  return {
    subtotal,
    totalAmount: subtotal, // Pickup is free
    verifiedItems,
  };
}
