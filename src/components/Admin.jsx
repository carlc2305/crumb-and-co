import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAvailability } from "../context/AvailabilityContext";
import { useOrders } from "../context/OrderContext";

function Admin() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { unavailableDates, toggleUnavailable, minimumOrderDate } =
    useAvailability();
  const { orders, updateOrderStatus } = useOrders();

  const isLoggedIn = sessionStorage.getItem("crumbCoAdmin") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/admin-login" replace />;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  function formatCalendarDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function formatDate(date) {
    if (!date) return "Not selected";

    const [year, month, day] = date.split("-");

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    ).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(time) {
    if (!time) return "Not selected";

    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    if (hour === 0) return `12:${minutes} AM`;

    if (hour < 12) return `${hour}:${minutes} AM`;

    if (hour === 12) return `12:${minutes} PM`;

    return `${hour - 12}:${minutes} PM`;
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage Crumb & Co orders and availability.</p>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={() => {
              sessionStorage.removeItem("crumbCoAdmin");
              window.location.href = "/admin-login";
            }}
          >
            Logout
          </button>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-icon">📦</span>

            <div>
              <strong>{orders.length}</strong>
              <span>Total Orders</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">🕐</span>

            <div>
              <strong>
                {orders.filter((order) => order.status === "Pending").length}
              </strong>
              <span>Pending Orders</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">💷</span>

            <div>
              <strong>
                £
                {orders
                  .filter((order) => order.status !== "Cancelled")
                  .reduce((total, order) => total + order.total, 0)
                  .toFixed(2)}
              </strong>
              <span>Total Revenue</span>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">🚫</span>

            <div>
              <strong>{unavailableDates.length}</strong>
              <span>Unavailable Dates</span>
            </div>
          </div>
        </div>

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Collection Availability</h2>
              <p>
                Click a date to make it available or unavailable for collection.
              </p>
            </div>
          </div>

          <div className="admin-calendar">
            <div className="calendar-header">
              <button
                type="button"
                onClick={goToPreviousMonth}
                aria-label="Previous month"
              >
                ←
              </button>

              <h3>{monthName}</h3>

              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Next month"
              >
                →
              </button>
            </div>

            <div className="calendar-weekdays">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="calendar-grid">
              {Array.from({
                length: firstDayOfMonth,
              }).map((_, index) => (
                <div className="calendar-empty" key={`empty-${index}`} />
              ))}

              {Array.from({
                length: daysInMonth,
              }).map((_, index) => {
                const day = index + 1;
                const date = formatCalendarDate(year, month, day);
                const isBeforeMinimumDate = date < minimumOrderDate;
                const isUnavailable =
                  isBeforeMinimumDate || unavailableDates.includes(date);

                return (
                  <button
                    type="button"
                    key={date}
                    className={`calendar-day ${
                      isUnavailable ? "unavailable" : "available"
                    } ${isBeforeMinimumDate ? "lead-time" : ""}`}
                    onClick={() => {
                      if (!isBeforeMinimumDate) {
                        toggleUnavailable(date);
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span>
                <span className="legend-box available" />
                Available
              </span>

              <span>
                <span className="legend-box unavailable" />
                Unavailable
              </span>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Your latest customer orders will appear here.</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="admin-orders-empty">
              <span>📦</span>

              <h3>No orders yet</h3>

              <p>
                Customer orders will appear here once a customer places an
                order.
              </p>
            </div>
          ) : (
            <div className="admin-orders-list">
              {orders
                .slice()
                .reverse()
                .map((order) => (
                  <div className="admin-order-card" key={order.id}>
                    <div className="admin-order-top">
                      <div>
                        <Link
                          to={`/admin/order/${order.id}`}
                          className="admin-order-link"
                        >
                          #{order.id}
                        </Link>

                        <span>
                          {order.customer.firstName} {order.customer.lastName}
                        </span>
                      </div>

                      <span
                        className={`order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="admin-order-items">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          <span>
                            {item.quantity} × {item.name}
                          </span>

                          <span>
                            £{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="admin-order-details">
                      <span>📅 {formatDate(order.collectionDate)}</span>

                      <span>⏰ {formatTime(order.collectionTime)}</span>

                      <strong>£{order.total.toFixed(2)}</strong>
                    </div>

                    <div className="admin-order-actions">
                      {order.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(order.id, "Completed")
                            }
                          >
                            Mark Complete
                          </button>

                          <button
                            type="button"
                            className="admin-cancel-button"
                            onClick={() => {
                              const confirmed = window.confirm(
                                "Are you sure you want to cancel this order?",
                              );

                              if (confirmed) {
                                updateOrderStatus(order.id, "Cancelled");
                              }
                            }}
                          >
                            Cancel Order
                          </button>
                        </>
                      )}

                      {order.status === "Cancelled" && (
                        <button
                          type="button"
                          className="admin-pending-button"
                          onClick={() => updateOrderStatus(order.id, "Pending")}
                        >
                          Restore Order
                        </button>
                      )}

                      {order.status === "Completed" && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, "Pending")}
                        >
                          Mark Pending
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Admin;
