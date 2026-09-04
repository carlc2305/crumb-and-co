import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext";

import { AvailabilityProvider } from "./context/AvailabilityContext";

import Product from "./components/Product";
import Header from "./components/Header";
import Home from "./components/Home";
import Shop from "./components/Shop";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderReview from "./components/OrderReview";
import Payment from "./components/Payment";
import OrderConfirmation from "./components/OrderConfirmation";
import Admin from "./components/Admin";
import AdminLogin from "./components/AdminLogin";
import { OrderProvider } from "./context/OrderContext";
import AdminOrder from "./components/AdminOrder";

import "./App.css";

function App() {
  return (
    <CartProvider>
      <AvailabilityProvider>
        <OrderProvider>
          <BrowserRouter>
            <Header />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-review" element={<OrderReview />} />
              <Route path="/payment" element={<Payment />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmation />}
              />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/order/:orderId" element={<AdminOrder />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </AvailabilityProvider>
    </CartProvider>
  );
}

export default App;
