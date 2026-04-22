# 🛒 Grocery Pro – Frontend

## 📌 Overview
**Grocery Pro** is a lightweight, user-friendly web application designed for small and medium-sized grocery store owners in Nepal. It replaces manual inventory processes with a simple digital system that remains accessible even for users with limited technical knowledge.

Unlike complex ERP or POS systems, Grocery Pro focuses strictly on practical, real-world needs—helping store owners manage stock efficiently, monitor movements, and improve day-to-day operations.

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
| **Admin** | Full inventory control, financial audit & write, user management, system configuration, security monitoring |
| **Owner** | Inventory control, vendor registry, financial audit, data reporting, security monitoring, system configuration |
| **Staff** | Ledger management, inventory view-only, vendor registry, security monitoring, system settings view |

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
- Optimized for desktop and tablet devices  
- Mobile responsiveness is partially supported and will be improved in future updates  

---

## ⚙️ Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🔗 API Integration
This frontend connects to a custom backend via REST APIs.  
Make sure to configure the API base URL in your environment settings.

---

## 📤 CSV Export
Reports can be exported as CSV files using PapaParse.  
Useful for external analysis and record-keeping.

---

## 🚧 Limitations
- Mobile optimization is not fully complete  
- Depends on backend API availability  
- No offline support  

---

## 🔮 Future Improvements
- Full mobile responsiveness  
- Performance optimization  
- Enhanced UI/UX  
- Additional reporting features  

---

## 📄 License
This project is developed for educational purposes and is not currently intended for commercial use.
