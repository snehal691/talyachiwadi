# Talyachi Wadi Booking System

> This README is a short guide for the frontend teammate while backend code is still being finalized.

## Project structure

- `backend/` - Express + MongoDB backend
  - `models/` - Mongoose schemas
  - `controllers/` - request handlers
  - `routes/` - API endpoints
- `frontend/` - static HTML/CSS pages for the site

## Backend design overview

The backend is being built around three main models:

1. `Booking`
   - stores customer booking details
   - stores stay dates, room/guest counts, and payment mode/status
   - stores calculated totals for the booking
   - should support both online payment and cash-on-arrival

2. `Settings`
   - singleton admin configuration document
   - stores inventory limits and pricing values
   - admin can change rates and stock counts here

3. `RazorpayTransaction`
   - separate payment transaction record for online payments
   - linked to a booking via `bookingId`

---

## Booking model: what it tracks

A booking should include:

- Customer info
  - `fullName`
  - `email`
  - `mobileNumber`
- Stay info
  - `bookingType` (`deluxeRoom`, `coupleTent`, `groupTent`, etc.)
  - `checkIn`
  - `checkOut`
  - `nights`
- Quantity
  - `roomsBooked`
  - `guestsTotal`
  - `adults`
  - `kidsBelow5`
  - `kids5to10`
- Rate source
  - `settingsId` (reference to the active `Settings` document)
- Totals
  - `baseAmount`
  - `extrasAmount`
  - `totalAmount`
  - `onlinePayableAmount`
  - `amountDueAtProperty`
- Payment flow
  - `paymentMode`: `online` or `cash_on_arrival`
  - `paymentStatus`: `pending`, `paid`, `failed`, `refunded`
  - `bookingStatus`: `pending`, `confirmed`, `cancelled`, `completed`

### Important frontend rules

- If `paymentMode` is `online`, the booking should include `onlinePayableAmount`.
- If `paymentMode` is `cash_on_arrival`, the booking should include `amountDueAtProperty`.
- Meals are not required to be paid online in the current design.

---

## Settings model: admin configuration

`Settings` holds the current business rules and pricing:

- `totalDeluxeRooms` - number of deluxe rooms available
- `totalTents` - number of tents available
- `minGuestsPerRoom` / `maxGuestsPerRoom`
- `maxRoomsPerBooking`
- `maxGuestsPerBooking`
- `couplePackagePerNight` - room rate
- `coupleTentRate`
- `groupTentRate`
- `extraPersonRate`
- `kidBelow5Rate`
- `kid5to10Rate`
- `allowCashOnArrival`
- `allowOnlinePayment`
- `adminCanOverrideRates`

### Note

The current code stores price values in `Settings` so the frontend can use those rates to calculate totals.

---

## Frontend integration guidance

1. Fetch current settings from the backend.
2. Use those rates to calculate booking totals on the frontend.
3. Send booking data to the backend with:
   - customer data
   - stay dates
   - selected package/type
   - guest counts
   - calculated totals
   - `paymentMode`

### Expected frontend responsibilities

- show available package types
- enforce guest/room limits from settings
- compute final amount using settings values
- choose between online and cash payment
- on `cash_on_arrival`, send `amountDueAtProperty`
- on `online`, send `onlinePayableAmount`

---

## Current status / TODO

- backend booking API is not fully complete yet
- payment endpoint and transaction flow may change
- frontend should treat this as a working plan and coordinate final endpoint names with the backend developer

---

## Notes for the teammate

- This is a temporary explanation until the backend code is finalized.
- The most important thing is to keep booking logic in sync with `Settings` values.
- If the backend changes, update this README and the frontend logic accordingly.
