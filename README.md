# CarWash Connect: A Location-Based Car Wash Booking Platform

**CarWash Connect** is a full-stack, location-aware web platform designed to streamline the discovery and scheduling of automobile cleaning services. It bridges the gap between car owners and local car wash service centers by eliminating physical waiting queues through dynamic time-slot scheduling.

---

## 🌟 Key Features

### For Customers:
1. **Account Management:** Secure registration, bcrypt password hashing, and JWT-authenticated sessions.
2. **Location-Based Discovery:** HTML5 Geolocation API pinpoints the user's position; the **Haversine Formula** calculates exact geodesic distances in kilometers.
3. **Free Interactive Map:** Leaflet.js and OpenStreetMap render center locations with custom interactive pins without requiring paid Google Maps API keys.
4. **Collision-Proof Slot Booking:** Live 60-minute time slots between opening and closing hours. Unavailable or booked slots are automatically disabled on the frontend and strictly validated on the backend.
5. **Real-time Order History:** View pending, confirmed, and completed bookings with customer cancellation privileges.

### For Service Providers:
1. **Dedicated Provider Dashboard:** View real-time counters for Total Bookings, Pending Review, Confirmed Slots, and Total Revenue.
2. **Car Wash Profile Setup:** Configure center name, address, operating hours (e.g., 09:00 - 18:00), and GPS coordinates.
3. **Custom Service Packages:** Add, view, and delete wash packages with prices and duration estimates.
4. **Appointment Management:** Accept (Confirm) or Reject incoming requests and mark active washes as "Completed".

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Clean, responsive UI with no complicated framework build steps |
| **Mapping** | Leaflet.js & OpenStreetMap | Zero-cost, privacy-friendly map rendering and location markers |
| **Backend** | Node.js & Express.js | RESTful API architecture following MVC pattern |
| **Database** | MongoDB & Mongoose | Flexible NoSQL document database with schema validation |
| **Security** | bcryptjs & jsonwebtoken (JWT) | Password encryption and role-based route authorization |

---

## 📁 Project Architecture & Folder Structure

```text
carwash-connect/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile logic
│   │   ├── carWashController.js  # Car wash CRUD and nearby calculation
│   │   ├── serviceController.js  # Service package CRUD
│   │   └── bookingController.js  # Slot verification & booking operations
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role authorization
│   ├── models/
│   │   ├── User.js               # Customer and Provider schema
│   │   ├── CarWash.js            # Car wash center schema (with coordinates)
│   │   ├── Service.js            # Car wash services schema
│   │   └── Booking.js            # Booking schema with status tracking
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── carWashRoutes.js      # /api/carwashes endpoints
│   │   ├── serviceRoutes.js      # /api/services endpoints
│   │   └── bookingRoutes.js      # /api/bookings endpoints
│   ├── utils/
│   │   ├── distance.js           # Haversine distance formula implementation
│   │   └── seedData.js           # Sample data to test nearby & booking instantly
│   ├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── package.json              # Backend dependencies and scripts
│   └── server.js                 # Express application entry point
│
├── frontend/
│   ├── css/
│   │   └── style.css             # Unified styling, navbar, cards, forms, badges
│   ├── js/
│   │   ├── api.js                # Reusable fetch helper with token handling
│   │   ├── auth.js               # Login, register, logout logic
│   │   ├── map.js                # Leaflet map initialization & markers
│   │   ├── nearby.js             # Geolocation trigger & nearby list display
│   │   ├── booking.js            # Date & dynamic time-slot selection & booking
│   │   └── provider.js           # Provider dashboard & management actions
│   ├── index.html                # Public landing page with features & hero
│   ├── login.html                # Login page for both roles
│   ├── register.html             # Customer registration
│   ├── register-provider.html    # Provider registration
│   ├── dashboard.html            # Customer dashboard
│   ├── nearby.html               # Nearby car wash discovery + Leaflet map
│   ├── carwash-details.html      # Center details, available services, reviews
│   ├── booking.html              # Slot selection & booking submission
│   ├── my-bookings.html          # Customer booking history & cancellation
│   └── provider-dashboard.html   # Provider center, service, & booking management
│
└── README.md                     # Project documentation & viva explanation
```

---

## 🚀 How to Run the Project Locally

### 1. Prerequisites
- **Node.js** (v18+ or v20 LTS recommended - installed in `D:\nodejs`)
- **MongoDB** running locally on port 27017, OR a free **MongoDB Atlas** cloud cluster URI.

### 2. Configure Environment Variables
Inside `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/carwash_connect
JWT_SECRET=carwash_connect_secret_key_2026_supersecure
```
*(If using MongoDB Atlas, replace `MONGO_URI` with your connection string).*

### 3. Load Sample Demonstration Data
Run the seeder script to populate sample providers, car wash centers, services, and bookings:
```bash
cd backend
npm run seed
```

### 4. Start Backend Server
```bash
npm start
```
The server will start at: `http://localhost:5000`

### 5. Access the Frontend
Open your browser and navigate to:
`http://localhost:5000` or open `frontend/index.html` directly in your browser.

---

## 🔑 Demo Login Credentials (From Seed Data)

| Role | Email | Password | Features |
|---|---|---|---|
| **Customer** | `customer@gmail.com` | `password123` | Find nearby centers, view map, pick slots, book wash |
| **Provider 1** | `provider1@carwash.com` | `password123` | Owns "Sparkle Auto Spa & Wash", accepts bookings |
| **Provider 2** | `provider2@carwash.com` | `password123` | Owns "Speedy Wheels Express Wash" |

---

## 🎓 Viva & Presentation Questions

### Q1: How does the location discovery feature work?
> **Answer:** The frontend uses `navigator.geolocation.getCurrentPosition()` to obtain the user's latitude and longitude. These coordinates are sent to `/api/carwashes/nearby?lat=...&lng=...`. The backend iterates through registered centers and applies the **Haversine Formula** (which takes into account the spherical curvature of the Earth with radius $R = 6371\text{ km}$) to calculate the geodesic distance. The results are sorted in ascending order (nearest to farthest).

### Q2: How does the system prevent two customers from booking the same slot?
> **Answer:** We enforce two levels of protection:
> 1. **Frontend Level:** The `/api/bookings/slots/:washId?date=YYYY-MM-DD` endpoint returns an availability flag for each slot. Already booked slots are visually disabled (`disabled` attribute).
> 2. **Backend Concurrency Level:** When a customer submits a booking request to `POST /api/bookings`, the controller queries the database:
>    ```javascript
>    const count = await Booking.countDocuments({ washId, date, time, status: { $nin: ['Cancelled', 'Rejected'] } });
>    if (count >= capacity) throw new Error("Slot already booked");
>    ```
>    Even if two users click simultaneously, only the first request succeeds; the second receives an explicit `400 Bad Request` HTTP error.

### Q3: Why choose Leaflet + OpenStreetMap over Google Maps?
> **Answer:** Google Maps JavaScript API requires credit card billing, API key generation, and incurs billing charges beyond strict limits. Leaflet with OpenStreetMap is 100% open-source, free, lightweight, privacy-focused, and requires no API keys.