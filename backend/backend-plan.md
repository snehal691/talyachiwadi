# Backend Implementation Plan: Talyachiwadi

Based on the static frontend files (Home, Events, Activities, About, Gallery) and recent discussions, here is the expanded implementation plan for the Node.js/Express.js backend.

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
