"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  brand?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  unitPrice: number;
  primaryImageUrl?: string | null;
  quantity: number;
  availableStock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (
    product: {
      _id: string;
      name: string;
      slug: string;
      brand?: string;
      sku?: string;
      price: number;
      salePrice?: number;
      primaryImageUrl?: string | null;
      availableStock?: number;
    },
    quantity?: number
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "mb_ventures_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, isHydrated]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const addItem = (
    product: {
      _id: string;
      name: string;
      slug: string;
      brand?: string;
      sku?: string;
      price: number;
      salePrice?: number;
      primaryImageUrl?: string | null;
      availableStock?: number;
    },
    quantity = 1
  ) => {
    const available = product.availableStock ?? 10;
    if (available <= 0) {
      toast.error(`"${product.name}" is currently out of stock`);
      return;
    }

    const unitPrice =
      product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === product._id);

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, available);

        if (newQty === existing.quantity && existing.quantity >= available) {
          toast.info(`Maximum available stock (${available}) reached for this item`);
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          unitPrice,
          availableStock: available,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          sku: product.sku,
          price: product.price,
          salePrice: product.salePrice,
          unitPrice,
          primaryImageUrl: product.primaryImageUrl,
          quantity: Math.min(quantity, available),
          availableStock: available,
        };
        return [...prev, newItem];
      }
    });

    toast.success(`Added ${quantity > 1 ? `${quantity} × ` : ""} "${product.name}" to cart`);
    setIsDrawerOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const clampedQty = Math.min(quantity, item.availableStock || 10);
          if (quantity > clampedQty) {
            toast.info(`Only ${item.availableStock} available in stock`);
          }
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (item) {
        toast.info(`Removed "${item.name}" from cart`);
      }
      return prev.filter((i) => i.productId !== productId);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
