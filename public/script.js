/**
 * script.js — Shared JavaScript for Mini E-Commerce
 * Handles: Cart management (localStorage), UI helpers, Razorpay payment flow
 */

// ─── Product Catalogue ───────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "p1",
    name: "Laptop",
    price: 50000,
    desc: "High-performance laptop for work and gaming. Intel i7, 16GB RAM, 512GB SSD.",
    img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    emoji: "💻",
  },
  {
    id: "p2",
    name: "Headphones",
    price: 2000,
    desc: "Premium wireless headphones with noise cancellation and 30h battery life.",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    emoji: "🎧",
  },
  {
    id: "p3",
    name: "Mouse",
    price: 800,
    desc: "Ergonomic wireless mouse with precision tracking and silent clicks.",
    img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    emoji: "🖱️",
  },
];

// ─── Cart Helpers (localStorage) ─────────────────────────────────────────────
const Cart = {
  /** Get current cart array */
  get() {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  },

  /** Persist cart array */
  save(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    Cart.updateBadge();
  },

  /** Add or increment a product */
  add(productId) {
    const cart = Cart.get();
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }
    Cart.save(cart);
  },

  /** Remove a product entirely */
  remove(productId) {
    const cart = Cart.get().filter((item) => item.id !== productId);
    Cart.save(cart);
  },

  /** Update quantity (min 1) */
  setQty(productId, qty) {
    const cart = Cart.get();
    const item = cart.find((i) => i.id === productId);
    if (item) {
      item.qty = Math.max(1, parseInt(qty) || 1);
      Cart.save(cart);
    }
  },

  /** Total item count */
  count() {
    return Cart.get().reduce((sum, item) => sum + item.qty, 0);
  },

  /** Total price in rupees */
  total() {
    return Cart.get().reduce((sum, item) => sum + item.price * item.qty, 0);
  },

  /** Clear entire cart */
  clear() {
    localStorage.removeItem("cart");
    Cart.updateBadge();
  },

  /** Update navbar badge */
  updateBadge() {
    const badge = document.getElementById("cart-count");
    if (!badge) return;
    const count = Cart.count();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
    badge.classList.remove("bounce");
    void badge.offsetWidth; // reflow to restart animation
    badge.classList.add("bounce");
  },
};

// ─── Currency Formatter ───────────────────────────────────────────────────────
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = "info", duration = 3000) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast-msg ${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span> ${message}`;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Razorpay Payment Flow ────────────────────────────────────────────────────
async function initiatePayment() {
  const cart = Cart.get();
  if (cart.length === 0) return showToast("Your cart is empty!", "error");

  const payBtn = document.getElementById("pay-btn");
  const spinner = document.getElementById("pay-spinner");
  const payText = document.getElementById("pay-text");

  // Show loading state
  if (payBtn) payBtn.disabled = true;
  if (spinner) spinner.classList.add("show");
  if (payText) payText.textContent = "Creating order...";

  try {
    // Step 1: Create Razorpay order on backend
    const res = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Cart.total(), currency: "INR" }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Order creation failed");

    if (payText) payText.textContent = "Processing...";

    // Step 2: Open Razorpay Checkout
    const options = {
      key: data.key_id,
      amount: data.amount,
      currency: data.currency,
      name: "ShopEasy",
      description: "Order Payment",
      image: "https://via.placeholder.com/80x80/6c63ff/ffffff?text=SE",
      order_id: data.order_id,
      theme: { color: "#6c63ff" },

      // Step 3: On payment success → verify with backend
      handler: async function (response) {
        try {
          const verifyRes = await fetch("/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            // Save order details for success page
            const orderDetails = {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              amount: Cart.total(),
              items: Cart.get(),
              date: new Date().toLocaleString("en-IN"),
            };
            sessionStorage.setItem("orderDetails", JSON.stringify(orderDetails));
            Cart.clear();
            window.location.href = "/success.html";
          } else {
            throw new Error(verifyData.message || "Payment verification failed");
          }
        } catch (err) {
          showToast("Payment verification failed: " + err.message, "error");
          resetPayBtn();
        }
      },

      // Step 4: On payment modal close / failure
      modal: {
        ondismiss: function () {
          showToast("Payment cancelled. Please try again.", "info");
          resetPayBtn();
        },
      },

      prefill: {
        name: "Test Customer",
        email: "test@example.com",
        contact: "9999999999",
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      showToast("Payment failed: " + (response.error.description || "Unknown error"), "error");
      resetPayBtn();
    });

    rzp.open();
  } catch (err) {
    showToast("Error: " + err.message, "error");
    resetPayBtn();
  }
}

/** Reset pay button to normal state */
function resetPayBtn() {
  const payBtn = document.getElementById("pay-btn");
  const spinner = document.getElementById("pay-spinner");
  const payText = document.getElementById("pay-text");
  if (payBtn) payBtn.disabled = Cart.count() === 0;
  if (spinner) spinner.classList.remove("show");
  if (payText) payText.textContent = "Proceed to Pay";
}

// ─── Init: update badge on every page load ───────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  Cart.updateBadge();
});
