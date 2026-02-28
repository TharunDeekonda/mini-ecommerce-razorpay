# 🛒 ShopEasy — Mini E-Commerce with Razorpay Integration

A fully functional mini e-commerce web application built with **Node.js + Express** and **Razorpay Payment Gateway (Test Mode)**.

---

## 📁 Project Structure

```
payment-demo/
├── public/
│   ├── index.html      # Product listing page
│   ├── cart.html       # Cart management page
│   ├── success.html    # Order success page
│   ├── style.css       # Global styles
│   └── script.js       # Shared JS (cart logic, payment flow)
├── server.js           # Express backend
├── package.json
├── .env.example        # Environment variable template
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Clone / Download the project

```bash
cd payment-demo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in your **Razorpay Test Mode** API keys:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
PORT=3000
```

> **Where to get keys:** Log in to [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys → Generate Test Key

### 4. Run the server

```bash
# Production
npm start

# Development (auto-restart with nodemon)
npm run dev
```

### 5. Open in browser

```
http://localhost:3000
```

---

## 💳 Razorpay Test Credentials

### Test Cards

| Card Network | Card Number         | CVV | Expiry  |
|-------------|---------------------|-----|---------|
| Visa        | 4111 1111 1111 1111 | Any | Any future date |
| Mastercard  | 5267 3181 8797 5449 | Any | Any future date |

- **Name:** Any name
- **3D Secure OTP:** `1234` (or as shown on screen)

### Test UPI

- **UPI ID:** `success@razorpay` → Payment succeeds
- **UPI ID:** `failure@razorpay` → Payment fails (for testing failure flow)

### Test Net Banking

- Select any bank and use test credentials shown in the modal.

---

## 🔐 API Endpoints

### `POST /create-order`
Creates a new Razorpay order.

**Request body:**
```json
{
  "amount": 52800,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "order_XXXXXXXXXXXX",
  "amount": 5280000,
  "currency": "INR",
  "key_id": "rzp_test_XXXXXXXXXXXX"
}
```

---

### `POST /verify-payment`
Verifies Razorpay payment signature using HMAC-SHA256.

**Request body:**
```json
{
  "razorpay_order_id": "order_XXXXXXXXXXXX",
  "razorpay_payment_id": "pay_XXXXXXXXXXXX",
  "razorpay_signature": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

---

## 🌐 Deploying to Render

1. Push your project to **GitHub**
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables under **Environment** tab:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `PORT` = `10000` (Render uses this automatically)
7. Deploy!

---

## 🔒 Security Practices

- ✅ Razorpay secret key stored in `.env` (never in client code)
- ✅ HMAC-SHA256 signature verification on every payment
- ✅ `crypto.timingSafeEqual()` to prevent timing attacks
- ✅ Amount validation on backend before order creation
- ✅ `.env` file excluded from version control (add to `.gitignore`)

---

## 📱 Features

- **Responsive** design with Bootstrap 5 (mobile + desktop)
- **Cart badge** with live count updates
- **Quantity controls** in cart (+/-)
- **Toast notifications** for all actions
- **Loading spinner** during payment processing
- **Order summary** on success page
- **Graceful error handling** for payment failures

---

## ⚠️ Important Notes

- This project uses **Razorpay Test Mode** — no real money is charged
- Switch to **Live Mode** keys when going to production
- Never commit your `.env` file — add it to `.gitignore`
- `localStorage` is used for cart persistence (no database required)
- `sessionStorage` is used to pass order details to the success page

---

## 🛠️ Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | HTML5, CSS3, Bootstrap 5  |
| JavaScript | Vanilla JS (ES6+)          |
| Backend    | Node.js + Express.js       |
| Payments   | Razorpay SDK               |
| Security   | dotenv, crypto (built-in)  |
| Storage    | localStorage (cart)        |
