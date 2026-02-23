# Employee Management System

A role-based Employee Management System built with **Node.js**, **Express**, **EJS**, and **MongoDB**. The application supports separate workflows for administrators and employees, including attendance tracking, leave management, salary records, profile updates, and task assignment.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [How It Works](#how-it-works)
  - [Authentication and Authorization](#authentication-and-authorization)
  - [Admin Module](#admin-module)
  - [Employee Module](#employee-module)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run the Application](#run-the-application)
  - [Default Admin Account](#default-admin-account)
- [Routes](#routes)
- [Available Scripts](#available-scripts)
- [Configuration Notes](#configuration-notes)
- [Known Limitations & Suggested Improvements](#known-limitations--suggested-improvements)

## Overview

This project is a server-rendered HR management web app where:

- **Admins** can manage employees, monitor attendance, review leave requests, allocate salary, and assign tasks.
- **Employees** can view dashboards, check in/out, apply for leave, view salary records, update their profile, and track assigned tasks.

The system uses Express sessions for login state and EJS templates for rendering pages.

## Core Features

### Admin Features

- Admin dashboard with key summaries:
  - total employees,
  - today’s attendance count,
  - pending leave requests,
  - recent leave entries.
- Employee lifecycle management:
  - add employee,
  - edit employee,
  - view employee profile stats,
  - delete employee and associated records.
- Attendance monitoring:
  - view attendance by date,
  - view monthly attendance history for a specific employee,
  - identify absent employees for a selected day.
- Leave management:
  - list/filter leave applications,
  - view leave details,
  - approve or reject requests with remarks.
- Salary management:
  - view/filter salary records,
  - detect employees without salary for selected period,
  - allocate salary with bonuses/deductions,
  - update salary status/details.
- Task management:
  - assign tasks to employees,
  - view all tasks,
  - mark tasks as completed.

### Employee Features

- Personal dashboard with:
  - today’s attendance status,
  - recent pending leaves,
  - latest salary record.
- Profile:
  - view profile,
  - update name/contact/address.
- Attendance:
  - check in,
  - check out,
  - view recent and monthly attendance history.
- Leave:
  - submit leave requests,
  - list own leave applications,
  - view application details and decision remarks.
- Salary:
  - list salary records,
  - view detailed salary entry.
- Tasks:
  - view tasks assigned by admin.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS + express-ejs-layouts
- **Database:** MongoDB with Mongoose
- **Authentication:** Session-based auth (`express-session`)
- **Flash messaging:** `connect-flash`
- **Utilities:** `moment`, `method-override`, `cookie-parser`
- **Password security:** `bcryptjs`

## Project Structure

```text
Employee_Management/
├── app.js                      # App entry point and middleware setup
├── createAdmin.js              # Script to manually create an admin account
├── config/
│   └── createAdmin.js          # Auto-create admin on server startup if missing
├── controllers/
│   ├── admin.controller.js     # Admin business logic
│   ├── auth.controller.js      # Login/register/logout flows
│   └── employee.controller.js  # Employee business logic
├── middleware/
│   └── auth.middleware.js      # Auth + role guards
├── models/
│   ├── user.model.js
│   ├── attendance.model.js
│   ├── leave.model.js
│   ├── salary.model.js
│   └── task.model.js
├── routes/
│   ├── admin.routes.js
│   ├── auth.routes.js
│   └── employee.routes.js
├── public/
│   ├── css/style.css
│   └── js/main.js
└── views/                      # EJS templates for auth, admin, employee, layouts
```

## Data Models

### `User`

Stores both employee and admin users.

Key fields:

- `name`, `email`, `password`
- `role` (`employee` or `admin`)
- `department`, `position`, `joinDate`
- `contactNumber`, `address`, `profileImage`

### `Attendance`

Daily attendance records per employee.

Key fields:

- `employee` (ref to `User`)
- `date`, `checkIn`, `checkOut`
- `status` (`present`, `absent`, `half-day`, `late`)
- `workingHours`, `notes`

### `Leave`

Leave applications and review metadata.

Key fields:

- `employee` (ref to `User`)
- `leaveType` (`sick`, `casual`, `annual`, etc.)
- `startDate`, `endDate`, `duration`, `reason`
- `status` (`pending`, `approved`, `rejected`)
- `adminRemarks`, `reviewedBy`, `reviewedAt`

### `Salary`

Payroll records by employee/month.

Key fields:

- `employee` (ref to `User`)
- `month`, `year`, `baseSalary`
- `deductions[]`, `bonuses[]`
- `totalDeductions`, `totalBonuses`, `netSalary`
- `status` (`pending`, `paid`), `paymentDate`, `remarks`

### `Task`

Admin-assigned work items.

Key fields:

- `title`, `description`
- `assignedTo` (ref to `User`)
- `dueDate`
- `status` (`pending`, `completed`)

## How It Works

### Authentication and Authorization

- Users register/login via `/auth`.
- Passwords are hashed with bcrypt before storage.
- On successful login, user data is stored in session (`req.session.user`).
- Route protection is enforced via middleware:
  - `authMiddleware`: only authenticated users,
  - `adminMiddleware`: admin-only routes,
  - `employeeMiddleware`: employee-only routes.

### Admin Module

The admin module provides HR operations:

- manage users,
- audit attendance,
- review leave requests,
- control payroll,
- assign and track tasks.

### Employee Module

The employee module provides self-service operations:

- personal attendance actions,
- leave submission and tracking,
- salary visibility,
- profile maintenance,
- assigned task visibility.

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### Installation

```bash
git clone <your-repo-url>
cd Employee_Management
npm install
```

### Run the Application

```bash
npm run dev
```

or

```bash
npm start
```

The app runs by default on:

- `http://localhost:3000`

### Default Admin Account

On startup, the app attempts to auto-create an admin account if it does not already exist.

Default seeded credentials:

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

You can also run the manual admin script:

```bash
npm run create-admin
```

## Routes

### Public/Auth

- `GET /` – Landing page
- `GET /auth/login` – Login page
- `POST /auth/login` – Login submit
- `GET /auth/register` – Register page
- `POST /auth/register` – Register submit (employee role)
- `GET /auth/logout` – Logout

### Employee Routes (`/employee`)

- `GET /dashboard`
- `GET /profile`
- `POST /profile`
- `GET /attendance`
- `POST /attendance/check-in`
- `POST /attendance/check-out`
- `GET /attendance/history`
- `GET /leave`
- `GET /leave/apply`
- `POST /leave/apply`
- `GET /leave/:id`
- `GET /salary`
- `GET /salary/:id`
- `GET /tasks`

### Admin Routes (`/admin`)

- `GET /dashboard`
- `GET /employees`
- `GET /employees/add`
- `POST /employees/add`
- `GET /employees/:id`
- `POST /employees/:id`
- `DELETE /employees/:id`
- `GET /employees/:id/edit`
- `GET /attendance`
- `GET /attendance/:id`
- `GET /leave`
- `GET /leave/:id`
- `POST /leave/:id/approve`
- `POST /leave/:id/reject`
- `GET /salary`
- `GET /salary/allocate`
- `POST /salary/allocate`
- `GET /salary/:id`
- `PUT /salary/:id`
- `GET /tasks`
- `GET /tasks/assign`
- `POST /tasks/assign`
- `POST /tasks/:id/complete`

## Available Scripts

- `npm start` – Run app with Node.js.
- `npm run dev` – Run app with nodemon for development.
- `npm run create-admin` – Execute manual admin creation script.

## Configuration Notes

Current configuration is hardcoded in source (no `.env` support yet):

- MongoDB URL: `mongodb://127.0.0.1:27017/employee-management`
- Session secret: `employee-management-secret`
- Port fallback: `3000` (can be overridden by `PORT` env var)

For production, move secrets and connection strings to environment variables.


