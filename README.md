# ParkHex - Parking Management System

ParkHex is a web-based Parking Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). It helps parking lot owners manage parking slots, vehicle entry and exit, automatic billing, receipts and income reports, with role-based access for administrators and staff.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Business Rules](#business-rules)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Default Login Accounts](#default-login-accounts)
- [API Overview](#api-overview)
- [Production Build](#production-build)


## Features

### Administrator
- Secure login and logout
- Add, edit, and delete parking slots (car or bike)
- Set the hourly parking rate for each vehicle type
- Add and remove staff accounts
- Dashboard with total slots, available slots, parked vehicles, and today's income
- Daily and monthly income reports
- Access to all staff features

### Staff
- Secure login and logout
- Register vehicle entry (plate number, vehicle type, slot) and print an entry ticket
- Process vehicle exit with automatic bill calculation and a printable receipt
- View currently parked vehicles with search
- View and filter parking history

## Tech Stack

| Layer          | Technology                                       |
| -------------- | ------------------------------------------------ |
| Frontend       | React (Vite), React Router, Axios, Tailwind CSS  |
| Backend        | Node.js, Express.js                              |
| Database       | MongoDB with Mongoose (MongoDB Atlas supported)  |
| Authentication | JSON Web Token (JWT) and bcrypt (bcryptjs)       |

## Business Rules

- A parking slot can hold only one vehicle at a time.
- The same vehicle (plate number) cannot be parked twice at the same time.
- A vehicle can only be assigned to a slot of its own type (car or bike).
- An occupied slot cannot be edited or deleted.
- Billing is calculated as `hours = ceil((exit time - entry time) / 1 hour)`, with a minimum of 1 hour, and `amount = hours x rate per hour`.
- The hourly rate is stored on the ticket at entry time, so later rate changes do not affect vehicles that are already parked.
- Only administrators can manage slots, rates, staff, and reports.

## Project Structure

```
parkhex/
├── backend/
│   ├── server.js
│   ├── .env.example
│   └── src/
│       ├── config/          Database connection
│       ├── models/          User, Slot, Rate, Ticket
│       ├── middleware/      JWT authentication, role checks, error handling
│       ├── controllers/     Business logic
│       ├── routes/          API routes
│       └── utils/           Seed script, date helpers
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── public/
    └── src/
        ├── api/             Axios instance
        ├── context/         Authentication context
        ├── components/      Layout, Logo, ProtectedRoute, shared UI
        └── pages/           Login, Dashboard, Slots, Rates, Staff,
                             VehicleEntry, ParkedVehicles, History,
                             Reports, Receipt
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local installation or a free MongoDB Atlas cluster)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/parkhex.git
cd parkhex
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env        # On Windows: copy .env.example .env
```

Open the `.env` file and fill in your values (see [Environment Variables](#environment-variables)). Then create the initial data and start the server:

```bash
npm run seed                # Creates default users, rates, and sample slots
npm run dev                 # Starts the API at http://localhost:5000
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev                 # Starts the app at http://localhost:5173
```

During development, Vite forwards all `/api` requests to the backend on port 5000, so no extra configuration is needed.

## Environment Variables

Create a `backend/.env` file with the following values:

| Variable            | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `PORT`              | API port (default: 5000)                                                 |
| `MONGO_URI`         | MongoDB connection string                                                |
| `JWT_SECRET`        | Secret key used to sign login tokens (use a long random string)          |
| `JWT_EXPIRES_IN`    | Token lifetime, for example `7d`                                         |
| `CLIENT_URL`        | Frontend URL allowed by CORS, for example `http://localhost:5173`        |
| `TZ_OFFSET_MINUTES` | Time zone offset from UTC in minutes (Pakistan = 300), used for reports  |

Example:

```
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/parkhex?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
TZ_OFFSET_MINUTES=300
```

The currency label (default `Rs.`) can be changed in `frontend/src/utils.js`.

## Default Login Accounts

These accounts are created by the seed script (`npm run seed`):

| Role  | Email               | Password |
| ----- | ------------------- | -------- |
| Admin | admin@parkhex.com   | admin123 |
| Staff | staff@parkhex.com   | staff123 |

**Important:** Change these passwords before using the system in a real environment.

## API Overview

All routes except login require the header `Authorization: Bearer <token>`.

| Method | Endpoint                       | Access    | Description                                      |
| ------ | ------------------------------ | --------- | ------------------------------------------------ |
| POST   | `/api/auth/login`              | Public    | Log in                                           |
| GET    | `/api/auth/me`                 | Logged in | Get the current user                             |
| GET    | `/api/slots`                   | Logged in | List slots (`?status=&type=`)                    |
| POST   | `/api/slots`                   | Admin     | Add a slot                                       |
| PUT    | `/api/slots/:id`               | Admin     | Edit a slot                                      |
| DELETE | `/api/slots/:id`               | Admin     | Delete a slot                                    |
| GET    | `/api/rates`                   | Logged in | Get parking rates                                |
| PUT    | `/api/rates/:vehicleType`      | Admin     | Update the hourly rate                           |
| GET    | `/api/staff`                   | Admin     | List staff members                               |
| POST   | `/api/staff`                   | Admin     | Add a staff member                               |
| DELETE | `/api/staff/:id`               | Admin     | Remove a staff member                            |
| POST   | `/api/tickets/entry`           | Logged in | Register a vehicle entry                         |
| GET    | `/api/tickets/active`          | Logged in | List parked vehicles (`?q=`)                     |
| GET    | `/api/tickets/:id/preview`     | Logged in | Preview the current bill without closing         |
| POST   | `/api/tickets/:id/exit`        | Logged in | Process vehicle exit and generate the final bill |
| GET    | `/api/tickets/history`         | Logged in | Parking history with filters and pagination      |
| GET    | `/api/tickets/:id`             | Logged in | Get a single ticket or receipt                   |
| GET    | `/api/dashboard`               | Logged in | Dashboard statistics                             |
| GET    | `/api/reports/income`          | Admin     | Income report (`?group=daily\|monthly&from=&to=`) |

## Production Build

```bash
cd frontend
npm run build
```

This creates the `frontend/dist` folder, which can be served by any static hosting service. Before building, set `VITE_API_URL` to the public URL of your API (for example `https://your-api.com/api`), and set `CLIENT_URL` in the backend `.env` to the deployed frontend URL.
