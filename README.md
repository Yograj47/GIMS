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
    ├── controllers/
    ├── routes/
    ├── models/
    ├── middleware/
    ├── validation/
    ├── config/
    └── tests/
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
```bash
cd server
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

---

## 🔗 API Endpoints

| Endpoint        | Description            |
|----------------|------------------------|
| /auth          | Authentication         |
| /users         | User management        |
| /products      | Product management     |
| /categories    | Category management    |
| /suppliers     | Supplier management    |
| /transactions  | Stock transactions     |
| /reports       | Reports                |
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
