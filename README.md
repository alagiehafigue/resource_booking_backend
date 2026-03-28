# Campus Resource Booking System – Backend

Backend API for managing campus resources, bookings, authentication, and notifications.

Built with **Node.js**, **Express**, and **PostgreSQL**.

---

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication (Access & Refresh tokens in cookies)

---

## Base URL

**Production:**
[https://resource-booking-backend.onrender.com/api](https://resource-booking-backend.onrender.com/api)

**Local:**

```
http://localhost:5000/api
```

---

## Main Routes

| Route                | Description                                       |
| -------------------- | ------------------------------------------------- |
| `/api/auth`          | Authentication (login, register, refresh, logout) |
| `/api/resources`     | Manage resources                                  |
| `/api/bookings`      | Create and manage bookings                        |
| `/api/admin`         | Admin role actions                                |
| `/api/notifications` | User/Admin notifications                          |

---

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
DATABASE_URL=your_postgres_connection
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
```

---

## Install & Run Locally

```
npm install
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

## Authentication Flow

* Access token: 15 minutes, stored in **httpOnly cookie**
* Refresh token: 7 days, stored in **httpOnly cookie**
* Frontend must use:

```
credentials: "include"
```

---

## Deployment

* Hosted on **Render**
* Frontend hosted on **Vercel**
* CORS and cookies configured for both **localhost** and **production**

---

## Author

Campus Resource Booking System Project
