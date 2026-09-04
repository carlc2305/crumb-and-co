import { createContext, useContext, useEffect, useState } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem("crumbCoOrders");

    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => {
    localStorage.setItem("crumbCoOrders", JSON.stringify(orders));
  }, [orders]);

  function createOrder(orderDetails) {
    const newOrder = {
      id: `CC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "Pending",
      ...orderDetails,
    };

    setOrders((currentOrders) => [...currentOrders, newOrder]);

    return newOrder;
  }

  function updateOrderStatus(orderId, status) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
