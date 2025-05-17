# Kasha-Assesment

# 🛰️ Track & Trace Delivery System

A modular MERN-based system for tracking ARV deliveries, managing patient data, and visualizing delivery performance across healthcare facilities.

---

## 📦 Features

### ✅ Task 1: Delivery Capture API
- Secure login for staff (JWT-based)
- View and complete pending deliveries
- Capture delivery outcomes: success, failed, partial
- Record delivery time, geolocation, and rider photo
- Allow customer confirmation (signature or checkbox)
- Comment logging and delivery status tracking

### 📊 Task 2: Analytics & Dashboard
- Map view of all deliveries (Leaflet or Mapbox)
- Weekly trends chart: grouped by delivery status
- Real-time metrics: delivery success rate, average time, top riders
- Background auto-refresh for new delivery data

### 📝 Task 3: Customer Data Entry & Excel Upload
- Form to manually add new customers
- Upload Excel (.xlsx) for bulk data ingestion
- Field-level validation and error handling
- Summary confirmation dialog (success/failure count)
- Store metadata about upload attempts

---

## 🏗️ System Design

### 🧱 Architecture


- **Backend (Express API):**
  - Handles auth, data validation, delivery capture, and analytics
  - Secure endpoints (JWT)
  - Stores data in MongoDB (GeoJSON enabled)

- **Frontend (React):**
  - Admin panel with:
    - Dashboard charts
    - Map views
    - Upload & data entry forms
  - Uses Axios to call backend APIs
  - Responsive design with lightweight UI

- **Database:**
  - MongoDB (or optionally PostgreSQL)
  - Geo-capable for delivery map tracking
  - Data models:
    - `Customer`, `Delivery`, `Staff`, `Facility`, `Role`, `Product`


<img width="852" alt="Screenshot 2025-05-17 at 18 31 43" src="https://github.com/user-attachments/assets/e9dd63e7-5456-469a-84eb-8df3eb4a2960" />

---

### 🗂️ ERD Overview

- Customers include full delivery context for Excel upload
- Deliveries and outcomes normalized for tracking and history
- Role-based access control (rider/admin)
- Upload batches logged for traceability

  
<img width="1448" alt="Screenshot 2025-05-17 at 18 27 12" src="https://github.com/user-attachments/assets/ff411d3a-109e-4965-8bde-0e621c72892b" />

---

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18.x)
- MongoDB (local or cloud)
- Optional: Docker + Docker Compose

---

### 🔧 Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 💻 Frontend Setup
bash
Copy
Edit
cd frontend
npm install
npm start

### 📦 Environment Variables (.env)
env
Copy
Edit
PORT=5001
MONGO_URI=mongodb://localhost:27017/arv-tracker
JWT_SECRET=your_super_secret_key


### 📬 API Overview
#### 🔐 Auth
Endpoint	Method	Description
/auth/login	POST	Staff login, returns JWT

#### 📦 Deliveries
Endpoint	Method	Description
/deliveries/pending	GET	View staff’s assigned deliveries
/deliveries/complete	POST	Submit delivery outcome
/deliveries/map	GET	GeoJSON data for map display

#### 📊 Dashboard
Endpoint	Method	Description
/analytics/weekly	GET	Week-over-week delivery performance
/analytics/metrics	GET	Summary KPIs (e.g., success %, total)

#### 🧾 Data Entry
Endpoint	Method	Description
/customers/upload	POST	Upload Excel file
/customers/validate	POST	Preview errors without committing


#### 📁 Excel Upload Notes
Ensure the Excel sheet has the following columns:

Facility Name, Unique Identifier, Primary Phone, Alternate Phone, Client Age, Sex, Client Type,
Sub-County, Last VL Date, TCA Date, Preferred Delivery Date, Delivery Type, Delivery Package,
Preferred Location, Actual Delivery Date, Actual Location, Geocoordinates, Outcome, Delivery Time,
Returned to Site, Rider Name, Comments


### 📌 To Do / Enhancements
 Add supervisor role and escalations for failed deliveries

 OTP or PIN-based client confirmation

 Offline-first version (PWA)

 SMS alerts for delivery status


