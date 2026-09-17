# Inventarioya - Cloud POS, Multi-Branch Inventory & Gemini AI Analytics

A modern, full-stack Next.js SaaS Web Application and POS platform built for retail businesses, supermarkets, and multi-branch chains, fully synchronized with the Android Mobile App on Google Play Store.

## 🚀 Live Backend Integration

- **Base REST API URL**: `https://inventory-web-backend-c0fu.onrender.com`
- **Frontend Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Recharts

---

## 🛠️ REST API Endpoints Implemented

### 1. Authentication & Profile
- `POST /api/auth/login` (Role-based authentication: Shop Owner, Staff, SuperAdmin)
- `POST /api/auth/register` (Shop Owner registration)
- `POST /api/auth/forgot-password` (Dispatches 6-digit OTP verification)
- `POST /api/auth/reset-password` (Validates OTP & resets password)
- `GET /api/auth/me` (Profile details)
- `DELETE /api/auth/me` (Permanent account deletion safety modal)

### 2. Dashboard & Analytics
- `GET /api/dashboard/stats` (Today's sales, revenue, low stock counts, customer dues)
- `GET /api/dashboard/superadmin` (Platform-wide metrics, MRR, shop growth)
- `GET /api/reports/sales` (Sales reports & trend analysis)
- `GET / POST /api/sales` (Sales checkout & invoice search)
- `GET /api/sales/invoice/:invoiceNumber/print` (Thermal 80mm/58mm receipt printing)

### 3. Subscriptions & Payments
- `GET /api/subscriptions/packages` (Pricing tiers: Starter, Business Growth, Enterprise)
- `GET /api/subscriptions/payment-info` (Merchant bKash, Nagad, Rocket & Bank details)
- `POST /api/subscriptions/payments/manual` (Manual payment submission with TrxID)
- `GET /api/subscriptions/payments/my` (Shop payment history)
- `GET /api/subscriptions/payments/pending` (SuperAdmin payment review queue)
- `PATCH /api/subscriptions/payments/:id/approve` (SuperAdmin approve payment)
- `PATCH /api/subscriptions/payments/:id/reject` (SuperAdmin reject payment)

### 4. Inventory, Categories & Bulk CSV
- `GET / POST /api/categories` (Category classification)
- `GET / POST /api/items` (Product catalog & stock control)
- `POST /api/items/import-csv` (Bulk CSV inventory upload)
- `GET /api/export/inventory` (Export full inventory to CSV)
- `GET /api/export/sales` (Export sales records to CSV)
- `GET /api/export/customers` (Export customer dues to CSV)
- `GET /api/export/ledger/:customerId` (Export customer transaction ledger)

### 5. Shop Management & Operations
- `GET / POST /api/suppliers` (Vendor directory)
- `GET / POST /api/suppliers/purchase-orders` (Purchase order management)
- `GET / POST /api/branches` (Multi-branch outlet tracking)
- `GET / POST /api/expenses` & `DELETE /api/expenses/:id` (Daily shop operational costs)
- `GET / POST /api/staff` & `DELETE /api/staff/:id` (Employee management)
- `PATCH /api/staff/:id/permissions` (Granular permission matrix editor)

### 6. Gemini AI Intelligence Suite
- `GET /api/ai/predict-demand` (Product demand forecasting & stockout dates)
- `GET /api/ai/customer-credit-score/:customerId` (AI credit scoring & repayment probability)
- `GET /api/ai/business-advisor` (Weekly business profit optimization recommendations)

### 7. Recycle Bin & Audit Logs
- `GET /api/trash` (List soft-deleted items)
- `POST /api/trash/restore/:entityType/:id` (1-click restore)
- `DELETE /api/trash/permanent/:entityType/:id` (Permanent hard delete)
- `DELETE /api/trash/empty` (Empty all trash)
- `DELETE /api/audit-logs/cleanup?days=90` (Purge historical audit logs)

---

## 🏃 How to Run the App

```bash
cd Inventarioya
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production:
```bash
npm run build
npm run start
```
