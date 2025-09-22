import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import { getProducts, addToCart, getCart, checkout } from "./api/api";
import { Product, CartItem, User } from "./types";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleAddToCart = async (product: Product) => {
    const updatedCart = await addToCart(product);
    setCart(updatedCart);
  };

  const handleCheckout = async () => {
    const msg = await checkout();
    alert(msg);
    setCart([]);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div>
      <h1>Xin chào {user.email}</h1>
      <button onClick={() => setUser(null)}>Đăng xuất</button>
      <ProductList products={products} onAddToCart={handleAddToCart} />
      <Cart cart={cart} onCheckout={handleCheckout} />
    </div>
  );
}

export default App;
