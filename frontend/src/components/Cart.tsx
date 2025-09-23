import React from "react";
import { useAppContext } from "../context/AppContext";

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useAppContext();

  return (
    <div>
      <h2>Giỏ hàng</h2>
      {cart.length === 0 ? (
        <p>Giỏ hàng trống</p>
      ) : (
        <>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} - ${item.price}
                <button onClick={() => removeFromCart(item.id)}>Xóa</button>
              </li>
            ))}
          </ul>
          <button onClick={clearCart}>Xóa tất cả</button>
        </>
      )}
    </div>
  );
};

export default Cart;
