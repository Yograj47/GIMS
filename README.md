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

### Supplier receiving and returns

Verified users with supplier access can list receipts, lots, and returns under
`/api/v1/receiving`. The list endpoints accept `supplierId`, `page`, and `limit`.
Supplier write permission is required to post a receipt or return.

- `POST /receiving/receipts` accepts a UUID `requestKey`, `supplierId`,
  three-letter `currency`, optional `deliveryReference`, and an `items` array.
  Each item has `productId`, `unitId`, `quantity` in the selected unit,
  `unitCost` as a decimal string per selected unit, and optional
  `quarantinedQuantity` in base units, `batchNumber`, and `expiresOn`
  as a calendar date in `YYYY-MM-DD` format.
- `POST /receiving/returns` accepts a UUID `requestKey`, `lotId`, `bucket`
  (`sellable` or `quarantined`), `quantity` in base units, and `reason`.
  It records the source receipt and supplier automatically.

A repeated request key returns HTTP 409. Existing stock stays available as
unattributed stock. Stock-out transactions use received lots in receipt order
before drawing on unattributed stock. Expiry is captured for traceability.

The product list accepts `category` (a category ID) and `stockLevel`
(`healthy`, `low`, or `out`). Filters apply to both the results and the total count.

The supplier details page lets a product be linked to several suppliers.
Removing one link leaves the other supplier links and receipt history intact.
Existing supplier assignments appear in the catalog when there is no newer
link record for that supplier and product.

Use **Reports → Stock → Stock reconciliation** to compare the sellable product
balance with supplier lots, unattributed stock, and quarantined stock. Owners
and admins can record a physical sellable count with a reason. A count is
rejected if the balance changed before it was posted. Increases are added as
unattributed stock. Decreases consume unattributed stock first and then reduce
the oldest sellable lots. The resulting movement records the affected lots.

### Billing and accounting

- **Reports → Transactions** lets owners and admins issue a numbered sales
  invoice and record cash or bank payments. The invoice uses server-calculated
  line totals and shows the outstanding balance.
- **Suppliers → Supplier billing** lets owners and admins post one bill per
  goods receipt, record credits against linked returns, and settle the balance
  with cash or bank payments. The bill uses the receipt's recorded unit costs.
- **Reports → Accounting** shows posted debit and credit totals and the number
  of invoices awaiting inventory cost. Use **Post inventory cost** on a sales
  invoice after posting the supplier bills for its source lots. Sales with
  unknown stock provenance require manual reconciliation.

Billing currently uses NPR and sales require a zero configured tax rate.
Supplier credits apply up to the unpaid balance of the source bill. The
accounting report covers entries posted through these workflows.

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
