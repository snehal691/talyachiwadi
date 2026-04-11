# Backend Implementation Plan: Talyachiwadi

## 1. Project Overview & Scope of Work

The goal is to convert the static HTML website into a dynamic platform. Your specific scope of work now includes:
1.  **Developing a RESTful API** to handle data coming from frontend forms.
2.  **Razorpay Payment Gateway Integration** to allow users to pay for bookings online.
3.  **Designing the MongoDB Database** to accurately store bookings, payment statuses, enquiries, and administrative accounts.
4.  **Building an Admin Panel** using HTML/CSS/JS/EJS templates to keep development lean while allowing staff to manage operations.
5.  **Integrating the API into the existing frontend** setup.

### Note on Reviews & Gallery
> [!NOTE]
> The current frontend features hardcoded Reviews, Gallery images, and Activity lists. For now, this is kept completely **out of scope** (it will remain hardcoded HTML) until the client expressly requests dynamic management.

---

## 2. Technical Stack
- **Environment**: Node.js
- **Framework**: Express.js (Using EJS template engine for the Admin Panel)
- **Database**: MongoDB (using Mongoose ODM)
- **Authentication**: Session-based or JWT (JSON Web Tokens) for Admin login
- **Payments**: Razorpay Node.js SDK
- **Email/Notifications**: Nodemailer 
- **Validation**: express-validator

---

## 3. Database Models (MongoDB / Mongoose)

### A. Admin User Schema
*   `username` / `email` (String, Unique)
*   `password` (String, Hashed using bcrypt)
*   `role` (String, default: 'admin')

### B. Booking Schema (Updated for Payments)
Mapped to the `booking-box` form.
*   `fullName` (String, Required)
*   `email` (String, Required)
*   `mobile` (String, Required)
*   `checkInDate` (Date, Required)
*   `checkOutDate` (Date, Required)
*   `bookingType` (String, Enum: ['Stay', 'Destination Wedding', 'Corporate Event', ...])
*   `paymentStatus` (String, Enum: ['Pending', 'Paid', 'Failed'], default: 'Pending')
*   `razorpayOrderId` (String)
*   `razorpayPaymentId` (String)
*   `totalAmount` (Number)
*   `bookingStatus` (String, Enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending')
*   `createdAt` (Timestamp)

### C. Enquiry Schema
Mapped to the `enquiry-form` located in `events.html`.
*   `fullName` (String, Required)
*   `email` (String)
*   `mobile` (String, Required)
*   `eventType` (String) 
*   `message` (String)
*   `status` (String, Enum: ['New', 'In-Progress', 'Resolved'], default: 'New')
*   `createdAt` (Timestamp)

---

## 4. API Endpoints

### Auth Routes (Admin)
*   `POST /api/auth/login`: Authenticate admin.
*   `GET /api/auth/logout`: End admin session.

### Public Routes (Frontend)
*   `POST /api/bookings/create-order`: Accepts form data, saves a 'Pending' booking, and calls Razorpay to generate an Order ID. Returns the Order ID to the frontend to launch checkout.
*   `POST /api/bookings/verify-payment`: Checks Razorpay signature after user pays, updates `paymentStatus` to 'Paid', and changes `bookingStatus` to 'Confirmed'. Sends Confirmation Email.
*   `POST /api/enquiries`: Accept new event enquiry request.

### Admin Routes (Protected)
*   `GET /admin/dashboard`: Serve Admin HTML Dashboard.
*   `GET /api/admin/bookings`: Get all bookings data.
*   `PUT /api/admin/bookings/:id/status`: Change booking status manually.
*   `GET /api/admin/enquiries`: Get all event enquiries.
*   `PUT /api/admin/enquiries/:id/status`: Update enquiry status.

---

## 5. Admin Panel Architecture Recommendation

> [!TIP]
> **To answer your question:** Building a separate React admin portal will significantly increase the scope, complexity, and delivery time. You'd need to set up a whole new React app, handle state management (`Redux`/`Zustand`), create routing (`react-router`), and implement secure cross-origin API calls. 
> 
> **Better approach:** Because this is a simple CRUD dashboard for bookings and enquiries, we will build a server-side rendered admin panel using **Express + EJS (HTML/CSS)** or just static HTML files served securely. This easily shares the same server, takes 50% less time to build, and perfectly handles tables, viewing details, and updating statuses.

---

## 6. Frontend Integration Required

1.  **`index.html` (Razorpay flow)**:
    *   Change `<form>` submit to call `/api/bookings/create-order`.
    *   On success, pass the returned Order ID to the Razorpay Checkout JS script.
    *   On payment success in the Razorpay popup, call `/api/bookings/verify-payment` to securely verify the transaction.
2.  **`events.html`**:
    *   Call `/api/enquiries` directly.

---

## 7. Future considerations
*   *Auto-cancellation Cronjob*: Cancel 'Pending' bookings if the user closes Razorpay without paying.
*   *Webhook Handling*: Razorpay webhooks to handle edge cases (e.g., user pays but network disconnects before verification).


---

#  Talyachiwadi — Backend Guide & 7-Day Schedule


##  Admin Panel — React or EJS?

We are going to use React for this it is easy to make in react and easier to think in React



| | EJS (server-side HTML) | React (what you want ✅) |
|---|---|---|
| **Coding experience** | Like writing HTML with weird syntax | Component-based, easier to reason |
| **State management** | No state, every click is a page reload | useState, much more natural |
| **Setup time** | 0 extra setup | `create vite` — 2 minutes |
| **Complexity for CRUD** | Actually more confusing for beginners | Simple fetch + state = done |
| **Shares the same backend?** | Yes | Yes (just call your API) |

> [!TIP]
> We are making the admin panel a **separate Vite/React app** inside a folder called `admin/` at the root. It calls the same backend API. It's simpler to build AND simpler to maintain. You'll feel at home.

---

## 📁 Your Folder Structure (What Goes Where)

Here's what each one means:

```
backend/
├── index.js          ← Entry point. Starts the server.
├── app.js            ← Creates the Express app, sets up middleware.
├── .env              ← Secret keys (MongoDB URI, Razorpay keys, etc.)
│
├── db/
│   └── connect.js    ← MongoDB connection logic
│
├── models/           ← Mongoose schemas (what your data looks like)
│   ├── Booking.js
│   ├── Enquiry.js
│   └── Admin.js
│
├── routes/           ← URL paths (GET /api/bookings, POST /api/enquiries...)
│   ├── auth.routes.js
│   ├── booking.routes.js
│   ├── enquiry.routes.js
│   └── admin.routes.js
│
├── controllers/      ← The actual logic behind each route
│   ├── auth.controller.js
│   ├── booking.controller.js
│   ├── enquiry.controller.js
│   └── admin.controller.js
│
├── middleware/       ← Code that runs BEFORE your route (auth check, etc.)
│   └── protect.js    ← Check if admin is logged in
│
├── utlis/            ← Helper functions (rename to utils/)
│   └── sendEmail.js  ← Nodemailer helper
│
└── public/           ← Static files (if any)
```

---

## 🧱 Build Order — What to Code First

**Database → Models → Controllers → Routes → Test**

```
1. DB Connection
2. Models (schemas)
3. Auth (login/logout for admin)
4. Booking flow (create order → Razorpay → verify payment)
5. Enquiry form
6. Admin routes (protected CRUD)
7. React Admin Panel
8. Wire frontend HTML to backend
```

---

## 📅 7-Day Schedule

> [!IMPORTANT]
> This schedule assumes ~2-3 hours of coding per day. You don't need to be fast — just consistent. Each day has a clear goal so you always know what "done" looks like.

---

### ✅ Day 1 — Foundation & Database Connection

**Goal:** Server starts, connects to MongoDB, basic middleware is set up.

**What to code:**

**`index.js`** — starts the server
```js
import app from './app.js';
import { connectDB } from './db/connect.js';

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
```

**`app.js`** — Express setup
```js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // React admin
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('Talyachiwadi API is live 🏡'));

export default app;
```

**`db/connect.js`**
```js
import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};
```

**`.env`** — fill in your values
```
MONGO_URI=mongodb+srv://...
PORT=3000
JWT_SECRET=some_long_random_string
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

**Test:** `pnpm dev` → server starts → `http://localhost:3000/` → "Talyachiwadi API is live 🏡"

---

### ✅ Day 2 — Database Models

**Goal:** Three Mongoose models are created and ready to use.

**`models/Admin.js`**
```js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model('Admin', adminSchema);
```

**`models/Booking.js`**
```js
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true },
  mobile:   { type: String, required: true },
  checkInDate:  { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  bookingType:  { type: String, required: true },
  totalAmount:  { type: Number },
  paymentStatus: { type: String, enum: ['Pending','Paid','Failed'], default: 'Pending' },
  bookingStatus: { type: String, enum: ['Pending','Confirmed','Cancelled','Completed'], default: 'Pending' },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
```

**`models/Enquiry.js`**
```js
import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  fullName:  { type: String, required: true },
  email:     { type: String },
  mobile:    { type: String, required: true },
  eventType: { type: String },
  message:   { type: String },
  status: { type: String, enum: ['New','In-Progress','Resolved'], default: 'New' },
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
```

**Install missing packages:**
```bash
pnpm add bcryptjs jsonwebtoken nodemailer razorpay
```

**Test:** No errors when importing the models.

---

### ✅ Day 3 — Admin Auth (Login / Logout)

**Goal:** Admin can log in, gets a JWT cookie, and protected routes work.

**`controllers/auth.controller.js`**
```js
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ message: 'Logged in successfully' });
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};
```

**`middleware/protect.js`**
```js
import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**`routes/auth.routes.js`**
```js
import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';

const router = Router();
router.post('/login', login);
router.get('/logout', logout);
export default router;
```

Register in `app.js`:
```js
import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);
```

**Seed an admin (run once):**
Create a quick script `seed.js` and run `node seed.js` once:
```js
import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
await Admin.create({ email: 'admin@talyachiwadi.com', password: 'yourpassword123' });
console.log('Admin created!');
process.exit();
```

**Test using Postman/Thunder Client:**
- `POST /api/auth/login` with `{ email, password }` → should return success + set cookie

---

### ✅ Day 4 — Booking + Razorpay Flow

**Goal:** User fills form → creates Razorpay order → pays → payment is verified → booking is confirmed.

**Install Razorpay SDK:**
```bash
pnpm add razorpay
```

**`controllers/booking.controller.js`**
```js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Step 1: Create Razorpay order + save pending booking
export const createOrder = async (req, res) => {
  const { fullName, email, mobile, checkInDate, checkOutDate, bookingType, totalAmount } = req.body;

  const order = await razorpay.orders.create({
    amount: totalAmount * 100, // in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });

  const booking = await Booking.create({
    fullName, email, mobile, checkInDate, checkOutDate, bookingType, totalAmount,
    razorpayOrderId: order.id,
  });

  res.json({ orderId: order.id, bookingId: booking._id, amount: order.amount });
};

// Step 2: Verify Razorpay signature after payment
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body).digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  await Booking.findByIdAndUpdate(bookingId, {
    razorpayPaymentId: razorpay_payment_id,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
  });

  res.json({ message: 'Payment verified. Booking confirmed! 🎉' });
};
```

**`routes/booking.routes.js`**
```js
import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/booking.controller.js';

const router = Router();
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
export default router;
```

Register in `app.js`:
```js
import bookingRoutes from './routes/booking.routes.js';
app.use('/api/bookings', bookingRoutes);
```

**Test:** Use Thunder Client to POST to `/api/bookings/create-order` with dummy data.

---

### ✅ Day 5 — Enquiry Form + Admin CRUD Routes

**Goal:** Enquiry form works. Admin can view all bookings & enquiries and change statuses.

**`controllers/enquiry.controller.js`**
```js
import Enquiry from '../models/Enquiry.js';

export const createEnquiry = async (req, res) => {
  const enquiry = await Enquiry.create(req.body);
  res.status(201).json({ message: 'Enquiry received!', enquiry });
};
```

**`controllers/admin.controller.js`**
```js
import Booking from '../models/Booking.js';
import Enquiry from '../models/Enquiry.js';

export const getAllBookings = async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
};

export const updateBookingStatus = async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(req.params.id, { bookingStatus: req.body.status }, { new: true });
  res.json(updated);
};

export const getAllEnquiries = async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  res.json(enquiries);
};

export const updateEnquiryStatus = async (req, res) => {
  const updated = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
};
```

**`routes/admin.routes.js`** (all protected)
```js
import { Router } from 'express';
import { protect } from '../middleware/protect.js';
import { getAllBookings, updateBookingStatus, getAllEnquiries, updateEnquiryStatus } from '../controllers/admin.controller.js';

const router = Router();
router.use(protect); // All admin routes require login

router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/enquiries', getAllEnquiries);
router.put('/enquiries/:id/status', updateEnquiryStatus);

export default router;
```

Register in `app.js`:
```js
import enquiryRoutes from './routes/enquiry.routes.js';
import adminRoutes from './routes/admin.routes.js';
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin', adminRoutes);
```

---

### ✅ Day 6 — React Admin Panel (Vite)

**Goal:** A working React admin panel that shows bookings and enquiries.

**Setup:**
```bash
# At the root of your project (next to frontend/ and backend/)
cd /Users/madmax/Desktop/snehal/talyachiwadi
npx create-vite@latest admin -- --template react
cd admin
npm install
npm install axios react-router-dom
npm run dev
```

**What to build:**
- `LoginPage.jsx` — Email + password form → calls `POST /api/auth/login`
- `Dashboard.jsx` — Stats overview (total bookings, enquiries)  
- `BookingsPage.jsx` — Table of all bookings, dropdown to change status
- `EnquiriesPage.jsx` — Table of enquiries, dropdown to change status

**Folder structure for admin:**
```
admin/src/
├── pages/
│   ├── LoginPage.jsx
│   ├── Dashboard.jsx
│   ├── BookingsPage.jsx
│   └── EnquiriesPage.jsx
├── components/
│   └── Navbar.jsx
├── api/
│   └── axios.js     ← pre-configured axios with base URL + credentials
└── App.jsx
```

**`api/axios.js`**
```js
import axios from 'axios';
export default axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // sends cookies for auth
});
```

> [!TIP]
> For the admin panel design, keep it clean and minimal — a dark sidebar, white content area, simple tables. Don't spend too long on styling. The data is what matters.

---

### ✅ Day 7 — Wire Frontend HTML + Final Testing

**Goal:** The real website's HTML booking form actually calls your backend. Everything works end-to-end.

**In `index.html`, change the form submit:**
```html
<!-- Add Razorpay script -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

```js
// In your existing booking form's JS
document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = { /* collect form fields */ };

  // Step 1: Create order
  const res = await fetch('http://localhost:3000/api/bookings/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const { orderId, bookingId, amount } = await res.json();

  // Step 2: Open Razorpay popup
  const rzp = new Razorpay({
    key: 'rzp_test_YOUR_KEY',
    amount, order_id: orderId,
    name: 'Talyachiwadi',
    handler: async (response) => {
      // Step 3: Verify payment
      await fetch('http://localhost:3000/api/bookings/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...response, bookingId }),
      });
      alert('Booking Confirmed! 🎉');
    },
  });
  rzp.open();
});
```

**Final checklist before calling it done:**
- [ ] `POST /api/auth/login` works with real credentials
- [ ] `POST /api/bookings/create-order` creates a Razorpay order
- [ ] `POST /api/bookings/verify-payment` confirms booking
- [ ] `POST /api/enquiries` saves an enquiry
- [ ] `GET /api/admin/bookings` returns data (blocked without login)
- [ ] React admin can log in and see data
- [ ] HTML form triggers Razorpay and payment flow works

---

##  Bonus: Good Habits for a New Backend Dev

1. **Use try/catch or a wrapper** — Wrap controllers in an async error handler so your server doesn't crash on errors
2. **Never hardcode secrets** — Everything secret goes in `.env`, and `.env` is in `.gitignore` (check yours!)
3. **Test with Thunder Client** — Install the VS Code extension "Thunder Client" (better than Postman for beginners)
4. **Use `console.log` liberally at first** — It's okay. Log what comes in, log what goes out. Remove them later.
5. **Commit often** — `git add . && git commit -m "Day 3: auth done"` after every day

---

## 📦 Final Package List

```bash
# Already installed
express, mongoose, cors, cookie-parser, dotenv, express-rate-limit, zod

# Need to install
pnpm add bcryptjs jsonwebtoken razorpay nodemailer
```



## 📅 10-Day Plan (Apr 7 → Apr 16)

| Day | Date | Hours | Goal |
|-----|------|-------|------|
| **Day 1** | Mon, Apr 7 | 1.5h | `index.js` + `app.js` + `db/connect.js` → server starts & connects to MongoDB |
| **Day 2** | Tue, Apr 8 | 1.5h | All 3 models — `Admin.js`, `Booking.js`, `Enquiry.js`, `Setting,js` | 
| **Day 3** | Wed, Apr 9 | 1.5h | Auth — `auth.controller.js` + `protect.js` + `auth.routes.js` + seed admin |
| **Day 4** | Thu, Apr 10 | 1.5h | Razorpay — `booking.controller.js` + `booking.routes.js` |
| **Day 5** | Fri, Apr 11 | 1.5h | Enquiry route + all Admin CRUD routes (protected) |
| **Day 6** | Sat, Apr 12 | 1h | Test ALL API routes with Thunder Client, fix any bugs |
| **Day 7** | **Sun, Apr 13** | **5–6h 💪** | **React Admin Panel** — setup Vite + Login page + Bookings table + Enquiries table |
| **Day 8** | Mon, Apr 14 | 1.5h | Wire `index.html` booking form → backend + Razorpay popup |
| **Day 9** | Tue, Apr 15 | 1.5h | Wire `events.html` enquiry form → backend |
| **Day 10** | Wed, Apr 16 | 1.5h | End-to-end test everything + fix bugs + **done ✅** |

---


| Day | Goal | Hours | Details |
|-----|------|-------|---------|
| **Day 1** | Foundation & Database Connection | ✅ Done | `index.js` + `app.js` + `db/connect.js` → server starts & connects to MongoDB |
| **Day 2** | Database Models | ✅ Done | All 3 models — `Admin.js`, `Booking.js`, `Enquiry.js` |
| **Day 3** | Admin Auth | 1.5h | Auth — `auth.controller.js` + `protect.js` + `auth.routes.js` + seed admin |
| **Day 4** | Booking + Razorpay Flow | 1.5h | Razorpay — `booking.controller.js` + `booking.routes.js` |
| **Day 5** | Enquiry Form + Admin CRUD Routes | 1.5h | Enquiry route + all Admin CRUD routes (protected) |
| **Day 6** | Test API + React Admin Panel | 5–6h 💪 | Test ALL API routes with Thunder Client, fix bugs + **React Admin Panel** — setup Vite + Login page + Bookings table + Enquiries table |
| **Day 7** | Wire Frontend + Final Testing | 3h | Wire `index.html` booking form → backend + Razorpay popup, wire `events.html` enquiry form → backend, end-to-end test everything + fix bugs + **done ✅** |




```markdown
# Settings System Setup Guide

## Overview
This guide explains how to create a **Settings Model** and connect it to the booking system so clients can manage booking parameters (rooms, pricing, capacity, blackout dates) via admin panel.

---

## Step 1: Create Settings Model

**File:** `backend/models/settings.model.js`

```js
import mongoose, { Schema } from "mongoose";

const settingsSchema = new Schema({
    // Basic property information
    totalRooms: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    
    // Pricing
    pricePerNight: {
        type: Number,
        required: true,
        default: 5000, // in INR paise (so 5000 = ₹50)
        min: 0
    },
    
    // Guest capacity
    maxGuestsPerBooking: {
        type: Number,
        required: true,
        default: 10,
        min: 1
    },
    
    guestCapacityPerRoom: {
        type: Number,
        required: true,
        default: 2,
        min: 1
    },
    
    // Stay duration constraints
    minStayDays: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    
    maxStayDays: {
        type: Number,
        required: true,
        default: 30,
        min: 1
    },
    
    // Currency
    currency: {
        type: String,
        default: "INR",
        immutable: true
    },
    
    // Blackout dates - dates when no bookings allowed
    blackoutDates: [{
        type: Date
    }],
    
    // Timestamps
}, { timestamps: true });

// Export model
export const Settings = mongoose.model("Settings", settingsSchema);
```

---

## Step 2: Create Settings Admin Routes

**File:** `backend/routes/admin.routes.js` (Add these routes)

```js
// Add these imports at the top
import { getSettings, updateSettings } from '../controllers/admin.controller.js';

// Add these routes inside your admin router (before the export)
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);

// Full example structure:
/*
const router = Router();
router.use(protect); // All admin routes protected

// Existing routes...
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// NEW Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
*/
```

---

## Step 3: Add Controller Methods

**File:** `backend/controllers/admin.controller.js` (Add these functions)

```js
import { Settings } from '../models/settings.model.js';

// Get current settings
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        // If no settings exist, create default ones
        if (!settings) {
            settings = await Settings.create({});
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update settings
export const updateSettings = async (req, res) => {
    try {
        const { totalRooms, pricePerNight, maxGuestsPerBooking, maxStayDays, minStayDays, guestCapacityPerRoom, blackoutDates } = req.body;
        
        // Validate inputs
        if (pricePerNight && pricePerNight < 0) {
            return res.status(400).json({ message: "Price cannot be negative" });
        }
        
        if (maxStayDays && minStayDays && maxStayDays < minStayDays) {
            return res.status(400).json({ message: "Max stay must be >= min stay" });
        }
        
        // Update or create settings
        let settings = await Settings.findOne();
        
        if (!settings) {
            settings = await Settings.create(req.body);
        } else {
            settings = await Settings.findByIdAndUpdate(
                settings._id,
                req.body,
                { new: true, runValidators: true }
            );
        }
        
        res.json({ message: "Settings updated successfully", settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

---

## Step 4: Connect Settings to Booking Controller

**File:** `backend/controllers/booking.controller.js` (Modify createOrder function)

```js
import { Settings } from '../models/settings.model.js';
import { Booking } from '../models/booking.model.js';

export const createOrder = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, checkIn, checkOut, guestCount, bookingType } = req.body;
        
        // Step 1: Fetch current settings
        const settings = await Settings.findOne();
        if (!settings) {
            return res.status(500).json({ message: "Booking settings not configured. Please contact admin." });
        }
        
        // Step 2: Validate booking against settings
        
        // Check 1: Guest count validation
        if (guestCount > settings.maxGuestsPerBooking) {
            return res.status(400).json({ 
                message: `Maximum ${settings.maxGuestsPerBooking} guests allowed` 
            });
        }
        
        // Check 2: Stay duration validation
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        if (numberOfNights < settings.minStayDays) {
            return res.status(400).json({ 
                message: `Minimum stay is ${settings.minStayDays} nights` 
            });
        }
        
        if (numberOfNights > settings.maxStayDays) {
            return res.status(400).json({ 
                message: `Maximum stay is ${settings.maxStayDays} nights` 
            });
        }
        
        // Check 3: Blackout dates validation
        const isBlackoutDate = settings.blackoutDates.some(date => {
            const blackoutDate = new Date(date);
            return blackoutDate >= checkInDate && blackoutDate <= checkOutDate;
        });
        
        if (isBlackoutDate) {
            return res.status(400).json({ 
                message: "Selected dates are not available (blackout period)" 
            });
        }
        
        // Step 3: Calculate total amount based on settings
        const totalAmount = settings.pricePerNight * numberOfNights;
        
        // Step 4: Create booking with settings-based amount
        const bookingData = {
            fullName,
            email,
            mobileNumber,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guestCount,
            bookingType,
            totalAmount
        };
        
        const booking = await Booking.create(bookingData);
        
        // Step 5: Create Razorpay order
        // ... (rest of Razorpay logic remains same)
        
        res.json({ 
            message: "Booking created successfully",
            booking,
            totalAmount 
        });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
```

---

## Step 5: Usage Flow

### Admin Updates Settings (via admin panel):
```
Admin Panel → Settings Form
↓
Fill: totalRooms: 5, pricePerNight: 5000, maxGuestsPerBooking: 10, minStayDays: 1, maxStayDays: 30
↓
PUT /api/admin/settings (with data above)
↓
Settings saved in MongoDB
```

### User Books Room:

```
User fills booking form → checkIn, checkOut, guestCount
↓
Frontend calls POST /api/bookings/create-order
↓
Backend fetches settings from DB
↓
Validates: guestCount (5) <= maxGuestsPerBooking (10) ✓
Validates: nights (3) <= maxStayDays (30) ✓
Validates: dates not in blackoutDates ✓
↓
Calculates: totalAmount = 5000 × 3 = 15000
↓
Creates Razorpay order with amount: 15000
↓
Returns orderId to frontend
```

---

## Testing Checklist

- [ ] Create Settings model file
- [ ] Create default settings document in MongoDB (run seed script)
- [ ] Test GET /api/admin/settings (should return current settings)
- [ ] Test PUT /api/admin/settings (update a field like pricePerNight)
- [ ] Test POST /api/bookings/create-order with different guest counts
- [ ] Verify booking validation works (too many guests, invalid dates, etc.)
- [ ] Verify pricing is calculated correctly from settings

---

## Next Steps

1. **Create the Settings model** (`settings.model.js`)
2. **Add the controller methods** to `admin.controller.js`
3. **Add the routes** to `admin.routes.js`
4. **Update the booking controller** to use settings
5. **Create a seed script** to initialize default settings
6. **Build React admin panel** for settings management (SettingsPage.jsx)
```

---

Just copy this entire markdown content and save it as `backend/SETTINGS-SETUP.md` in your project. Then you can follow it step-by-step! 📝---

Just copy this entire markdown content and save it as `backend/SETTINGS-SETUP.md` in your project. Then you can follow it step-by-step! 📝