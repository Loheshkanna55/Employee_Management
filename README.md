# Blood Donation App

A full-stack web application that connects blood donors, recipients, and administrators in one workflow-driven platform.

Built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **Passport.js**, and **EJS**.

---

## Table of Contents
- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [User Roles and Flow](#user-roles-and-flow)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Major Routes](#major-routes)
- [Status Lifecycle](#status-lifecycle)
- [Screens and UI](#screens-and-ui)
- [Known Gaps / Future Improvements](#known-gaps--future-improvements)
- [Contributing](#contributing)

---

## Overview

The Blood Donation App helps:

- **Donors** register blood donation requests.
- **Recipients** submit blood requests.
- **Admins** review requests, accept/reject them, schedule donations/receiving, and update blood bank stock.

It includes an end-to-end journey:

1. User signs up / logs in.
2. User submits donation or blood request.
3. Admin reviews and updates status.
4. User schedules appointment after approval.
5. Admin confirms completion and stock changes are reflected in blood bank records.
6. User tracks updates through a dedicated status page.

---

## Core Features

### Authentication & Session Management
- User registration and login using Passport Local Strategy.
- Password hashing via `bcryptjs` (Mongoose pre-save hook).
- Persistent sessions stored in MongoDB with `connect-mongo`.
- Logout support with session destroy.

### Donor Flow
- Submit a blood donation form (details + health info + amount + location).
- Prevent duplicate active submissions when a pending item already exists.
- Schedule donation appointment after approval.
- Track approval/scheduling/completion status.

### Recipient Flow
- Submit a blood request form (blood type, amount, reason, location).
- View available blood bank locations and stock by district.
- Schedule blood receiving appointment after approval.
- Track request and schedule status.

### Admin Flow
- View/manage donation and request submissions.
- Approve/reject submissions.
- View scheduled donor and recipient appointments.
- Remove schedules when needed.
- Mark blood as received/issued and update blood bank inventory.

### Status Tracking
- Unified status screen for donation/request lifecycle.
- Displays schedule details (date, time, address) when available.
- Handles scenarios like pending, accepted, cancelled schedule, completed, rejected.

---

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Auth:** Passport.js (Local Strategy)
- **Templating:** EJS
- **Session Store:** connect-mongo
- **Utilities:** dotenv, multer, connect-flash
- **Frontend Assets:** Static CSS + images in `public/`

---

## Project Structure

```text
BloodDonationApp/
├── app.js
├── package.json
├── config/
│   └── createAdmin.js
├── models/
│   ├── User.js
│   ├── BloodDonation.js
│   ├── BloodRequest.js
│   ├── BloodBank.js
│   ├── schedule.js
│   ├── requestSchedule.js
│   └── ConfirmedSchedule .js
├── routes/
│   ├── auth.js
│   ├── donate.js
│   ├── receive.js
│   ├── admin.js
│   ├── status.js
│   ├── Schedule.js
│   ├── requestSchedule.js
│   └── availability.js
├── views/
│   ├── *.ejs
│   └── partials/
└── public/
    ├── css/
    ├── js/
    └── images/
```

---

## Data Models

### `User`
- `username`, `email`, `password`, `role` (`user` or `admin`)
- Password hashed before save.

### `BloodDonation`
- Donor profile + donation details.
- Tracks lifecycle status and scheduling metadata.

### `BloodRequest`
- Recipient profile + request reason + amount.
- Tracks lifecycle status and scheduling metadata.

### `BloodBank`
- District/location-wise blood inventory (`A+`, `A-`, `B+`, etc.)
- Multiple addresses per location.

### `Schedule`
- Donor scheduling details (date, slot, health checklist, address).

### `ScheduleRequest`
- Recipient scheduling details (session, slot, blood amount, prescription flag).

---

## User Roles and Flow

### User
- Register/login
- Create donation/request
- Schedule after approval
- Monitor progress in status page

### Admin
- Access admin panels
- Review all submissions
- Approve/reject and manage schedules
- Update stock movement after blood is handled

---

## Environment Variables

Create a `.env` file in project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/blood-donation-app
SECRET=your_session_secret
PORT=3000
ADMIN_PASSWORD=your_admin_password
```

> `createAdmin.js` auto-creates an admin user (if none exists) at startup using `ADMIN_PASSWORD`.

---

## Getting Started

### 1) Clone repository
```bash
git clone https://github.com/<your-username>/BloodDonationApp.git
cd BloodDonationApp
```

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment
Create `.env` (see [Environment Variables](#environment-variables)).

### 4) Run the server
```bash
npm start
```

Server starts on:
- `http://localhost:3000` (default)

---

## Available Scripts

- `npm start` → starts Express app (`node app.js`)
- `npm test` → currently placeholder script

---

## Major Routes

### Auth
- `GET /` → login page
- `GET /register` → registration page
- `POST /register` → create user account
- `POST /login` → authenticate user
- `GET /logout` → logout user

### User Features
- `GET /home`
- `GET /donate`
- `POST /donate/donate`
- `GET /receive`
- `POST /receive/receive`
- `GET /availability/:district`
- `GET /schedule`
- `POST /schedule`
- `GET /request-schedule/:district`
- `POST /request-schedule`
- `GET /status`

### Admin Features (mounted under `/admin`)
- Donation/request management routes
- Status transition routes (accept/reject/complete)
- Schedule listing/removal routes
- Receive-stock update routes

> Refer to `routes/admin.js` for the full admin route set.

---

## Status Lifecycle

The app uses lifecycle statuses across donation/request entities:

- `Pending`
- `Accepted`/`Approved` (implementation has both references)
- `Schedule Removed`
- `Rejected`
- `Completed`

Status page composes database state and schedule records to show the user-friendly current stage.

---

## Screens and UI

Key EJS screens include:
- `login`, `register`, `home`
- `donate`, `receive`
- `schedule`, `requestSchedule`
- `status`, `availability`
- `admin-home`, `admin-donations`, `admin-requests`, `adminSchedule`, `adminReceiveSchedule`, `adminHistory`

Shared partials:
- `views/partials/header.ejs`
- `views/partials/footer.ejs`
- `views/partials/home-header.ejs`

---

## Known Gaps / Future Improvements

- Add automated tests (unit/integration) for core user/admin flows.
- Harden admin route protection with centralized admin middleware.
- Standardize lifecycle enum values (`Accepted` vs `Approved`).
- Rename `models/ConfirmedSchedule .js` to remove trailing space in filename.
- Remove fallback hardcoded session secret and enforce env-only secret.
- Add API docs (OpenAPI/Postman) and deployment guide.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

For major changes, open an issue first to discuss scope and design.

---

If you want, I can also generate:
- a **one-page recruiter-ready README variant** (short + polished), and
- a **portfolio/demo script** for interviews using this project.
