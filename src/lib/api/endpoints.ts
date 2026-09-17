/**
 * API Endpoints Registry for Inventarioya
 * Directly mirrored from backend Flutter ApiEndpoints specification.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventory-web-backend-c0fu.onrender.com";

export const ApiEndpoints = {
  baseUrl: API_BASE_URL,

  // ===========================================================================
  // AUTHENTICATION ENDPOINTS
  // ===========================================================================
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
  resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  me: `${API_BASE_URL}/api/auth/me`,
  deleteAccount: `${API_BASE_URL}/api/auth/me`,

  // ===========================================================================
  // DASHBOARD & ANALYTICS ENDPOINTS
  // ===========================================================================
  dashboardStats: `${API_BASE_URL}/api/dashboard/stats`,
  superAdminDashboard: `${API_BASE_URL}/api/dashboard/superadmin`,
  reportsSales: `${API_BASE_URL}/api/reports/sales`,
  sales: `${API_BASE_URL}/api/sales`,
  printInvoice: (invoiceNumber: string) =>
    `${API_BASE_URL}/api/sales/invoice/${invoiceNumber}/print`,

  // ===========================================================================
  // SUBSCRIPTIONS & PAYMENTS ENDPOINTS
  // ===========================================================================
  subscriptionPackages: `${API_BASE_URL}/api/subscriptions/packages`,
  paymentInfo: `${API_BASE_URL}/api/subscriptions/payment-info`,
  submitManualPayment: `${API_BASE_URL}/api/subscriptions/payments/manual`,
  myPayments: `${API_BASE_URL}/api/subscriptions/payments/my`,
  pendingPayments: `${API_BASE_URL}/api/subscriptions/payments/pending`,
  approvePayment: (id: string) =>
    `${API_BASE_URL}/api/subscriptions/payments/${id}/approve`,
  rejectPayment: (id: string) =>
    `${API_BASE_URL}/api/subscriptions/payments/${id}/reject`,

  // ===========================================================================
  // SUPERADMIN SHOP MANAGEMENT ENDPOINTS
  // ===========================================================================
  adminShops: `${API_BASE_URL}/api/admin/shops`,
  adminShopById: (id: string) => `${API_BASE_URL}/api/admin/shops/${id}`,

  // ===========================================================================
  // INVENTORY & CATEGORY ENDPOINTS
  // ===========================================================================
  categories: `${API_BASE_URL}/api/categories`,
  items: `${API_BASE_URL}/api/items`,
  itemById: (id: string) => `${API_BASE_URL}/api/items/${id}`,
  importCsv: `${API_BASE_URL}/api/items/import-csv`,

  // ===========================================================================
  // CUSTOMER ENDPOINTS
  // ===========================================================================
  customers: `${API_BASE_URL}/api/customers`,
  customerById: (id: string) => `${API_BASE_URL}/api/customers/${id}`,

  // ===========================================================================
  // STAFF & MANAGER ENDPOINTS
  // ===========================================================================
  staff: `${API_BASE_URL}/api/staff`,
  staffById: (id: string) => `${API_BASE_URL}/api/staff/${id}`,
  staffPermissions: (id: string) =>
    `${API_BASE_URL}/api/staff/${id}/permissions`,

  // ===========================================================================
  // RECYCLE BIN & DATA RECOVERY ENDPOINTS
  // ===========================================================================
  trash: `${API_BASE_URL}/api/trash`,
  trashRestore: (entityType: string, id: string) =>
    `${API_BASE_URL}/api/trash/restore/${entityType}/${id}`,
  trashPermanent: (entityType: string, id: string) =>
    `${API_BASE_URL}/api/trash/permanent/${entityType}/${id}`,
  trashEmpty: `${API_BASE_URL}/api/trash/empty`,
  auditLogsCleanup: (days: number = 90) =>
    `${API_BASE_URL}/api/audit-logs/cleanup?days=${days}`,

  // ===========================================================================
  // SUPPLIERS & PURCHASE ORDERS ENDPOINTS
  // ===========================================================================
  suppliers: `${API_BASE_URL}/api/suppliers`,
  supplierById: (id: string) => `${API_BASE_URL}/api/suppliers/${id}`,
  purchaseOrders: `${API_BASE_URL}/api/suppliers/purchase-orders`,

  // ===========================================================================
  // BRANCH MANAGEMENT ENDPOINTS
  // ===========================================================================
  branches: `${API_BASE_URL}/api/branches`,
  branchById: (id: string) => `${API_BASE_URL}/api/branches/${id}`,

  // ===========================================================================
  // SHOP EXPENSES ENDPOINTS
  // ===========================================================================
  expenses: `${API_BASE_URL}/api/expenses`,
  expenseById: (id: string) => `${API_BASE_URL}/api/expenses/${id}`,

  // ===========================================================================
  // GEMINI AI PREDICTIONS & INTELLIGENCE ENDPOINTS
  // ===========================================================================
  aiPredictDemand: `${API_BASE_URL}/api/ai/predict-demand`,
  aiCustomerCreditScore: (customerId: string) =>
    `${API_BASE_URL}/api/ai/customer-credit-score/${customerId}`,
  aiBusinessAdvisor: `${API_BASE_URL}/api/ai/business-advisor`,

  // ===========================================================================
  // BULK CSV DATA EXPORT ENDPOINTS
  // ===========================================================================
  exportInventory: `${API_BASE_URL}/api/export/inventory`,
  exportCustomers: `${API_BASE_URL}/api/export/customers`,
  exportSales: `${API_BASE_URL}/api/export/sales`,
  exportCustomerLedger: (customerId: string) =>
    `${API_BASE_URL}/api/export/ledger/${customerId}`,
};
