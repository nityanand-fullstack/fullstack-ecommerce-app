import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from "../api/cartApi.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

const emptyState = { items: [], count: 0, subtotal: 0 };

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [state, setState] = useState(emptyState);
  const [loading, setLoading] = useState(false);

  const applyResponse = (data) => {
    setState({
      items: data?.cart?.items || [],
      count: data?.count || 0,
      subtotal: data?.subtotal || 0,
    });
  };

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setState(emptyState);
      return;
    }
    setLoading(true);
    try {
      const res = await getCartApi();
      applyResponse(res.data);
    } catch {
      setState(emptyState);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const addToCart = async (productId, qty = 1) => {
    const res = await addToCartApi(productId, qty);
    applyResponse(res.data);
    return res;
  };

  const updateQty = async (productId, qty) => {
    const res = await updateCartItemApi(productId, qty);
    applyResponse(res.data);
    return res;
  };

  const removeItem = async (productId) => {
    const res = await removeCartItemApi(productId);
    applyResponse(res.data);
    return res;
  };

  const clear = async () => {
    const res = await clearCartApi();
    applyResponse(res.data);
    return res;
  };

  const value = {
    items: state.items,
    count: state.count,
    subtotal: state.subtotal,
    loading,
    addToCart,
    updateQty,
    removeItem,
    clear,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
