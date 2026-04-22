# 🛒 Grocery Pro – Frontend

## 📌 Overview
Grocery Pro is a lightweight and user-friendly web application designed for small and medium-sized grocery store owners in Nepal. It simplifies inventory management by replacing manual processes with a digital system that is easy to use, even for users with limited technical knowledge.

Unlike complex ERP or POS systems, Grocery Pro focuses on practical, real-world needs—helping store owners efficiently manage stock, monitor movements, and improve daily operations.

---

## 🎯 Target Users
- Grocery Store Owners (Small to Medium)
- Admin Users
- Store Staff

---

## ✨ Features

### 📊 Dashboard
- Total stock overview  
- Daily stock movement summary  
- Low stock alerts  
- 7-day stock in/out visualization  
- Activity highlights and alerts  

### 📦 Inventory Management
- Product management  
- Category management  
- Unit & multiplier configuration  
- Supplier management  

### 📑 Reports Hub
- Stock report  
- Movement history  
- Transaction report  
- Activity logs (audit trail)  

### 👤 User Features
- User profile management  
- Role-based access control  

---

## 🔐 Role-Based Access

| Role   | Permissions |
|--------|------------|
| **Admin** | Full Inventory Control, Financial Audit & Write, User Management, System Configuration, Security Monitoring |
| **Owner** | Inventory Control, Vendor Registry, Financial Audit, Data Reporting, Security Monitoring, System Configuration |
| **Staff** | Ledger Management, Inventory View-Only, Vendor Registry, Security Monitoring, System Settings View |

---

## 🛠️ Tech Stack

- **Framework:** React (Vite)  
- **Language:** JavaScript  
- **Styling:** Tailwind CSS + shadcn/ui  
- **State Management:** Zustand  
- **Routing:** React Router  
- **Forms:** React Hook Form  
- **Data Export:** PapaParse (CSV export)  
- **API Integration:** REST API  

---

## 🌐 Responsiveness
- Optimized for **desktop** and **tablet devices**  
- Mobile responsiveness is partially supported and will be improved in future updates  

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd client

2. Install Dependencies
npm install
3. Run Development Server
npm run dev
🔗 API Integration

This frontend connects to a custom backend via REST APIs.
Make sure to configure the API base URL in your environment settings.

📤 CSV Export
Reports can be exported as CSV files using PapaParse
Useful for external analysis and record-keeping
🚧 Limitations
Mobile optimization is not fully complete
Depends on backend API availability
No offline support
🔮 Future Improvements
Full mobile responsiveness
Performance optimization
Enhanced UI/UX
Additional reporting features
📄 License

This project is developed for educational purposes and is not currently intended for commercial use.

