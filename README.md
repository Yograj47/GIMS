# 🛒 Grocery Pro  
### Full Stack Inventory Management System

![Status](https://img.shields.io/badge/status-development-orange)
![Frontend](https://img.shields.io/badge/frontend-React-blue)
![Backend](https://img.shields.io/badge/backend-Node.js-green)
![Database](https://img.shields.io/badge/database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/license-educational-lightgrey)

---

## 📌 Overview
**Grocery Pro** is a full-stack inventory management system built for small and medium-sized grocery stores in Nepal.

It replaces manual stock tracking with a streamlined digital workflow focused on simplicity, speed, and usability instead of unnecessary ERP complexity.

---

## 🎯 Target Users
- Store Owners  
- Admins  
- Store Staff  

---

## 🚀 Features

### 📊 Dashboard
- Stock overview  
- Daily stock movement  
- Low stock alerts  
- 7-day analytics  
- Activity highlights  

### 📦 Inventory Management
- Product CRUD  
- Category & unit management  
- Supplier management  

### 🔄 Transactions
- Stock-in / stock-out tracking  
- Transaction history  
- Automated stock updates  

### 📑 Reports
- Stock reports  
- Transaction reports  
- Activity logs (audit trail)  

### 🔐 Authentication & Security
- JWT authentication  
- Role-based access control  
- Password hashing (bcrypt)  
- Rate limiting  

---

## 🖥️ Tech Stack

### Frontend
- React (Vite)  
- Tailwind CSS  
- shadcn/ui  
- Zustand  
- React Router  
- React Hook Form  
- PapaParse  

### Backend
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT (jsonwebtoken)  
- bcryptjs  
- Zod  
- Nodemailer (Brevo SMTP)  
- express-rate-limit  
- Jest + Supertest  

---

## 📁 Project Structure

```
root/
│
├── client/                # Frontend (React)
│
└── server/                # Backend (Node.js)
    ├── server.js          # HTTP and Socket.IO startup
    └── src/
        ├── app.js         # Express app and API routes
        ├── config/        # Database connection
        ├── modules/       # Domain routes, services, repositories, and models
        └── shared/        # Middleware, logging, email, and sockets
```

---

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd gims
```

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 3. Setup Backend

Run these commands from the repository root after creating the server environment file. Use a supported Node.js release (20.19+, 22.12+, or 24+) and a MongoDB deployment that supports transactions, such as an Atlas cluster or a local replica set.

```bash
cd server
npm install
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_sender_email
```

For local development, set these values in the client's `.env` file.

```env
VITE_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔗 API Endpoints

Routes below are relative to `/api/v1`.

| Endpoint        | Description            |
|----------------|------------------------|
| /auth          | Authentication         |
| /users         | User management        |
| /products      | Product management     |
| /categories    | Category management    |
| /suppliers     | Supplier management    |
| /transactions  | Stock transactions     |
| /analytics     | Analytics              |
| /alerts        | Alerts                 |

---

## 🔄 System Workflow
1. User performs action from frontend  
2. Request sent to backend API  
3. Input validated (Zod)  
4. Controller processes logic  
5. Database updated  
6. Activity logged  
7. Alerts triggered (if applicable)  
8. Response returned  

---

## 🚧 Limitations
- No POS or barcode integration  
- No offline support  
- Limited mobile responsiveness  
- Not production deployed  

---

## 🔮 Future Improvements
- Mobile app (React Native / Flutter)  
- Barcode & POS integration  
- Stock prediction (AI/ML)  
- Cloud deployment  
- Advanced analytics dashboard  
- Push/SMS notifications  

---

## 📄 License
This project is for educational purposes only and is not intended for commercial use.

---

## 👨‍💻 Author
**Yograj Rijal**
