import { createContext, useContext, useEffect, useState } from "react";

const OrderContext = createContext();

const API_URL = "http://localhost:4242";

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Load orders from PostgreSQL when the app starts
  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = sessionStorage.getItem("crumbCoAdminToken");

        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders.");
        }

        const data = await response.json();

        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Create a new order in PostgreSQL
  async function createOrder(orderDetails) {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order.");
      }

      setOrders((currentOrders) => [data, ...currentOrders]);

      return data;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  }

  // Update an order's status in PostgreSQL
  async function updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("crumbCoAdminToken")}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? data : order)),
      );

      return data;
    } catch (error) {
      console.error("Update order status error:", error);
      throw error;
    }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        ordersLoading,
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
