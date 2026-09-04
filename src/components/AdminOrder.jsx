import { Link, useParams, Navigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";

function AdminOrder() {
  const { orderId } = useParams();
  const { orders, updateOrderStatus } = useOrders();

  const isLoggedIn = sessionStorage.getItem("crumbCoAdmin") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <h1>Order Not Found</h1>
          <p>We couldn't find this order.</p>

          <Link to="/admin" className="admin-back-button">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <Link to="/admin" className="admin-back-button">
          ← Back to Orders
        </Link>

        <div className="admin-order-detail-header">
          <div>
            <p className="admin-order-detail-label">Order</p>
            <h1>#{order.id}</h1>
          </div>

          <span className={`order-status ${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>

        <div className="admin-order-detail-grid">
          <section className="admin-section">
            <h2>Customer Details</h2>

            <div className="admin-detail-list">
              <div>
                <strong>Name</strong>
                <span>
                  {order.customer.firstName} {order.customer.lastName}
                </span>
              </div>

              <div>
                <strong>Email</strong>
                <span>{order.customer.email}</span>
              </div>

              <div>
                <strong>Phone</strong>
                <span>{order.customer.phone}</span>
              </div>
            </div>
          </section>

          <section className="admin-section">
            <h2>Collection Details</h2>

            <div className="admin-detail-list">
              <div>
                <strong>Date</strong>
                <span>{order.collectionDate}</span>
              </div>

              <div>
                <strong>Time</strong>
                <span>{order.collectionTime}</span>
              </div>

              <div>
                <strong>Fulfilment</strong>
                <span>
                  {order.fulfilment === "collection"
                    ? "Collection"
                    : "Delivery"}
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="admin-section">
          <h2>Order Items</h2>

          <div className="admin-detail-items">
            {order.items.map((item) => (
              <div className="admin-detail-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>Quantity: {item.quantity}</span>
                </div>

                <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
              </div>
            ))}

            <div className="admin-detail-total">
              <span>Total</span>
              <strong>£{order.total.toFixed(2)}</strong>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2>Order Notes</h2>

          <div className="admin-order-notes">
            {order.notes ? (
              <p>{order.notes}</p>
            ) : (
              <p className="no-order-notes">
                No notes were provided with this order.
              </p>
            )}
          </div>
        </section>

        <section className="admin-section">
          <h2>Order Status</h2>

          <div className="admin-status-actions">
            {order.status === "Pending" ? (
              <button
                type="button"
                onClick={() => updateOrderStatus(order.id, "Completed")}
                className="admin-complete-button"
              >
                ✓ Mark Order Complete
              </button>
            ) : (
              <button
                type="button"
                onClick={() => updateOrderStatus(order.id, "Pending")}
                className="admin-pending-button"
              >
                Mark as Pending
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminOrder;
