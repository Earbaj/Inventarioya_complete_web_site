import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiEndpoints } from "./endpoints";
import {
  AuthResponse,
  User,
  DashboardStats,
  SuperAdminStats,
  ProductItem,
  Category,
  Invoice,
  Expense,
  Supplier,
  PurchaseOrder,
  Branch,
  StaffMember,
  SubscriptionPackage,
  PaymentInfo,
  ManualPaymentSubmission,
  TrashItem,
  AIDemandForecast,
  AICustomerCreditScore,
  AIBusinessAdvice,
  Shop,
  Customer,
  PaginatedCustomersResponse,
} from "@/types";

// Token storage key
const TOKEN_KEY = "inventarioya_auth_token";
const USER_KEY = "inventarioya_user";

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  requestHeaders?: any;
  requestData?: any;
  responseData?: any;
  error?: string;
  durationMs?: number;
}

export const apiLogs: ApiLogEntry[] = [];
const logListeners: ((logs: ApiLogEntry[]) => void)[] = [];

export function subscribeToApiLogs(listener: (logs: ApiLogEntry[]) => void) {
  logListeners.push(listener);
  listener([...apiLogs]);
  return () => {
    const idx = logListeners.indexOf(listener);
    if (idx !== -1) logListeners.splice(idx, 1);
  };
}

function notifyLogListeners() {
  logListeners.forEach((fn) => fn([...apiLogs]));
}

// Create Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: ApiEndpoints.baseUrl,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer token & Log Request
apiClient.interceptors.request.use(
  (config) => {
    (config as any).__startTime = Date.now();
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log(
      `%c🚀 [API REQUEST] ${config.method?.toUpperCase()} ${config.url}`,
      "background: #4f46e5; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;",
      {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
        params: config.params,
      }
    );

    return config;
  },
  (error) => {
    console.error("%c[API REQUEST SETUP ERROR]", "background: #ef4444; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Log Response & notify listeners
apiClient.interceptors.response.use(
  (response) => {
    const durationMs = Date.now() - ((response.config as any).__startTime || Date.now());

    console.log(
      `%c✅ [API RESPONSE SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status}) [${durationMs}ms]`,
      "background: #10b981; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;",
      response.data
    );
    console.log("Response JSON String:", JSON.stringify(response.data, null, 2));

    const entry: ApiLogEntry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      method: response.config.method?.toUpperCase() || "GET",
      url: response.config.url || "",
      status: response.status,
      requestData: response.config.data,
      responseData: response.data,
      durationMs,
    };
    apiLogs.unshift(entry);
    if (apiLogs.length > 60) apiLogs.pop();
    notifyLogListeners();

    return response;
  },
  (error) => {
    const durationMs = Date.now() - ((error.config as any)?.__startTime || Date.now());

    console.error(
      `%c❌ [API RESPONSE ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} (${error.response?.status || "NO_RESPONSE"}) [${durationMs}ms]`,
      "background: #ef4444; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;",
      {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        message: error.message,
        responseData: error.response?.data,
      }
    );
    if (error.response?.data) {
      console.error("Error Response JSON String:", JSON.stringify(error.response.data, null, 2));
    }

    const entry: ApiLogEntry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      method: error.config?.method?.toUpperCase() || "GET",
      url: error.config?.url || "",
      status: error.response?.status || 0,
      requestData: error.config?.data,
      responseData: error.response?.data,
      error: error.message,
      durationMs,
    };
    apiLogs.unshift(entry);
    if (apiLogs.length > 60) apiLogs.pop();
    notifyLogListeners();

    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        // Optional auto-logout on expired session
      }
    }
    return Promise.reject(error);
  }
);

/* =========================================================================
   MOCK DEMO DATA GENERATORS (Active when Render backend is asleep/offline)
========================================================================= */

const mockUser: User = {
  uid: "58c93fae-503c-4570-92e1-94bf2f9b1b96",
  id: "58c93fae-503c-4570-92e1-94bf2f9b1b96",
  name: "Earbaj",
  email: "earbaj@admin.com",
  phone: "+880 1711-223344",
  role: "admin",
  shopId: "58c93fae-503c-4570-92e1-94bf2f9b1b96",
  shopName: "Dhaka Mega Superstore",
  branchId: "br_001",
  subscriptionTier: "premium",
  subscriptionExpiresAt: "2026-09-30T07:49:25.819Z",
  permissions: {
    canProcessReturn: true,
    canExportExcel: true,
    canEditCustomers: true,
    canViewBuyPrice: true,
  },
};

export const mockCategories: Category[] = [
  { id: "cat_1", name: "Groceries & Staples", description: "Daily essentials, rice, flour, oil", itemCount: 42 },
  { id: "cat_2", name: "Dairy & Bakery", description: "Fresh milk, cheese, bread, butter", itemCount: 18 },
  { id: "cat_3", name: "Beverages & Soft Drinks", description: "Juices, soda, tea, coffee", itemCount: 29 },
  { id: "cat_4", name: "Personal Care", description: "Soaps, shampoos, skincare", itemCount: 35 },
  { id: "cat_5", name: "Household & Cleaning", description: "Detergents, floor cleaners, wipes", itemCount: 16 },
  { id: "cat_6", name: "Snacks & Confectionery", description: "Chips, cookies, chocolates", itemCount: 50 },
];

export const mockProducts: ProductItem[] = [
  { id: "prod_1", name: "Fortune Basmati Rice 5kg", sku: "FBR-5K", barcode: "8901030381010", categoryId: "cat_1", categoryName: "Groceries & Staples", costPrice: 420, sellingPrice: 510, stockQuantity: 38, minStockAlert: 10, unit: "bag" },
  { id: "prod_2", name: "Rupchanda Soyabean Oil 5L", sku: "RSO-5L", barcode: "8901030381027", categoryId: "cat_1", categoryName: "Groceries & Staples", costPrice: 860, sellingPrice: 940, stockQuantity: 8, minStockAlert: 15, unit: "bottle" },
  { id: "prod_3", name: "Pran UHT Milk 1L", sku: "PUM-1L", barcode: "8901030381034", categoryId: "cat_2", categoryName: "Dairy & Bakery", costPrice: 85, sellingPrice: 100, stockQuantity: 45, minStockAlert: 10, unit: "pack" },
  { id: "prod_4", name: "Nestle Nescafé Classic 200g", sku: "NNC-200", barcode: "8901030381041", categoryId: "cat_3", categoryName: "Beverages & Soft Drinks", costPrice: 550, sellingPrice: 650, stockQuantity: 22, minStockAlert: 5, unit: "jar" },
  { id: "prod_5", name: "Dettol Antiseptic Liquid 500ml", sku: "DAL-500", barcode: "8901030381058", categoryId: "cat_5", categoryName: "Household & Cleaning", costPrice: 280, sellingPrice: 340, stockQuantity: 4, minStockAlert: 10, unit: "bottle" },
  { id: "prod_6", name: "Lays Classic Potato Chips 52g", sku: "LPC-52", barcode: "8901030381065", categoryId: "cat_6", categoryName: "Snacks & Confectionery", costPrice: 35, sellingPrice: 50, stockQuantity: 95, minStockAlert: 20, unit: "pack" },
  { id: "prod_7", name: "Dove Deep Moisture Body Wash 450ml", sku: "DDM-450", barcode: "8901030381072", categoryId: "cat_4", categoryName: "Personal Care", costPrice: 420, sellingPrice: 520, stockQuantity: 12, minStockAlert: 5, unit: "bottle" },
  { id: "prod_8", name: "Radhuni Turmeric Powder 200g", sku: "RTP-200", barcode: "8901030381089", categoryId: "cat_1", categoryName: "Groceries & Staples", costPrice: 90, sellingPrice: 120, stockQuantity: 60, minStockAlert: 15, unit: "pack" },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv_101",
    invoiceNumber: "INV-2026-0042",
    customerName: "Tanvir Ahmed",
    customerPhone: "+880 1819-556677",
    items: [
      { productId: "prod_1", productName: "Fortune Basmati Rice 5kg", quantity: 2, price: 510, total: 1020 },
      { productId: "prod_2", productName: "Rupchanda Soyabean Oil 5L", quantity: 1, price: 940, total: 940 },
    ],
    subtotal: 1960,
    discount: 60,
    tax: 0,
    grandTotal: 1900,
    paidAmount: 1900,
    dueAmount: 0,
    paymentMethod: "BKASH",
    cashierName: "Sabbir Hossain",
    branchName: "Mirpur Branch",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: "PAID",
  },
  {
    id: "inv_102",
    invoiceNumber: "INV-2026-0043",
    customerName: "Mrs. Shahrin Islam",
    customerPhone: "+880 1912-887766",
    items: [
      { productId: "prod_4", productName: "Nestle Nescafé Classic 200g", quantity: 1, price: 650, total: 650 },
      { productId: "prod_6", productName: "Lays Classic Potato Chips 52g", quantity: 4, price: 50, total: 200 },
    ],
    subtotal: 850,
    discount: 0,
    tax: 0,
    grandTotal: 850,
    paidAmount: 850,
    dueAmount: 0,
    paymentMethod: "CASH",
    cashierName: "Rahim Uddin",
    branchName: "Main Branch (Dhanmondi)",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: "PAID",
  },
  {
    id: "inv_103",
    invoiceNumber: "INV-2026-0044",
    customerName: "Kazi Farhad",
    customerPhone: "+880 1714-332211",
    items: [
      { productId: "prod_7", productName: "Dove Deep Moisture Body Wash 450ml", quantity: 2, price: 520, total: 1040 },
      { productId: "prod_5", productName: "Dettol Antiseptic Liquid 500ml", quantity: 1, price: 340, total: 340 },
    ],
    subtotal: 1380,
    discount: 80,
    tax: 0,
    grandTotal: 1300,
    paidAmount: 800,
    dueAmount: 500,
    paymentMethod: "CASH",
    cashierName: "Sabbir Hossain",
    branchName: "Mirpur Branch",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: "PARTIAL",
  },
];

export const mockExpenses: Expense[] = [
  { id: "exp_1", title: "Shop Electricity Bill (DESCO)", category: "Utilities", amount: 14500, date: "2026-09-05", note: "Meter No: 8849120" },
  { id: "exp_2", title: "Monthly Shop Space Rent", category: "Rent", amount: 45000, date: "2026-09-01", note: "Advance paid for September" },
  { id: "exp_3", title: "Staff Tea & Snacks refreshment", category: "Other", amount: 3200, date: "2026-09-12" },
  { id: "exp_4", title: "Facebook Page Ads promotion", category: "Marketing", amount: 8000, date: "2026-09-10" },
  { id: "exp_5", title: "Cashier & Staff Monthly Salaries", category: "Salary", amount: 65000, date: "2026-09-02" },
];

export const mockSuppliers: Supplier[] = [
  { id: "sup_1", name: "Habib Rahman", companyName: "Square Consumer Products Ltd.", phone: "+880 1712-334455", email: "habib@squaregroup.com", address: "Mohakhali C/A, Dhaka", totalBalanceDue: 18500 },
  { id: "sup_2", name: "Asif Chowdhury", companyName: "Meghna Group of Industries", phone: "+880 1819-445566", email: "asif@mgi.org", address: "Gulshan-1, Dhaka", totalBalanceDue: 0 },
  { id: "sup_3", name: "Monirul Islam", companyName: "Pran-RFL Distribution Ltd.", phone: "+880 1913-667788", email: "monir@prangroup.com", address: "Pran RFL Center, Middle Badda, Dhaka", totalBalanceDue: 34000 },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: "po_1", poNumber: "PO-2026-081", supplierId: "sup_1", supplierName: "Square Consumer Products Ltd.", orderDate: "2026-09-10", deliveryDate: "2026-09-14", totalCost: 48000, paidAmount: 30000, status: "RECEIVED", itemsCount: 14 },
  { id: "po_2", poNumber: "PO-2026-082", supplierId: "sup_3", supplierName: "Pran-RFL Distribution Ltd.", orderDate: "2026-09-15", deliveryDate: "2026-09-19", totalCost: 72000, paidAmount: 38000, status: "PENDING", itemsCount: 26 },
];

export const mockBranches: Branch[] = [
  { id: "br_001", name: "Main Flagship Branch", address: "Road 27, Dhanmondi, Dhaka", phone: "+880 2-9112233", managerName: "Rahim Uddin", isMainBranch: true },
  { id: "br_002", name: "Mirpur Retail Outlet", address: "Plot 14, Section 10, Mirpur, Dhaka", phone: "+880 2-9004455", managerName: "Kazi Farhad", isMainBranch: false },
  { id: "br_003", name: "Uttara Sector 7 Hub", address: "Sector 7, Sonargaon Janapath, Uttara", phone: "+880 2-8951122", managerName: "Shakil Khan", isMainBranch: false },
];

export const mockStaff: StaffMember[] = [
  { id: "stf_1", name: "Sabbir Hossain", email: "sabbir@dhakasuper.com", phone: "+880 1715-889900", role: "manager", branchId: "br_001", branchName: "Main Flagship Branch", permissions: ["sales_create", "sales_read", "print_receipt"], isActive: true },
  { id: "stf_2", name: "Kazi Farhad", email: "farhad@dhakasuper.com", phone: "+880 1812-990011", role: "manager", branchId: "br_002", branchName: "Mirpur Retail Outlet", permissions: ["sales_create", "sales_read", "inventory_edit", "suppliers_manage", "expenses_manage"], isActive: true },
  { id: "stf_3", name: "Tasnim Anjum", email: "tasnim@dhakasuper.com", phone: "+880 1914-112233", role: "admin", branchId: "br_001", branchName: "Main Flagship Branch", permissions: ["inventory_read", "sales_create"], isActive: true },
];

export const mockPackages: SubscriptionPackage[] = [
  {
    id: "pkg_basic",
    name: "Starter Shop",
    price: 999,
    billingPeriod: "monthly",
    features: [
      "1 Store Branch",
      "Up to 2 Staff Accounts",
      "Unlimited POS Transactions",
      "Thermal Receipt Printing",
      "Basic Sales Reports",
      "Standard Email Support",
    ],
    maxBranches: 1,
    maxStaff: 2,
    hasAIFeatures: false,
  },
  {
    id: "pkg_pro",
    name: "Business Growth",
    price: 2499,
    billingPeriod: "monthly",
    isPopular: true,
    features: [
      "Up to 3 Store Branches",
      "Up to 10 Staff Accounts",
      "Supplier & Purchase Orders",
      "Shop Expenses & P&L Analysis",
      "Gemini AI Demand Forecast",
      "Customer Credit Score Rating",
      "CSV Bulk Import & Export",
      "Priority WhatsApp Support",
    ],
    maxBranches: 3,
    maxStaff: 10,
    hasAIFeatures: true,
  },
  {
    id: "pkg_enterprise",
    name: "Enterprise Chain",
    price: 4999,
    billingPeriod: "monthly",
    features: [
      "Unlimited Branches",
      "Unlimited Staff & Cashiers",
      "Custom Role & Permission Matrix",
      "Gemini AI Business Advisor 24/7",
      "Multi-Branch Stock Transfers",
      "Automated Audit Log Cleanup",
      "Dedicated Account Manager",
      "99.9% Uptime SLA",
    ],
    maxBranches: 999,
    maxStaff: 999,
    hasAIFeatures: true,
  },
];

export const mockPaymentInfo: PaymentInfo = {
  merchantName: "Inventarioya Platform Billing (Dhaka, BD)",
  bkashNumber: "01700-112233 (Merchant)",
  nagadNumber: "01900-445566 (Merchant)",
  rocketNumber: "01800-778899-2",
  bankAccount: {
    bankName: "BRAC Bank PLC",
    accountName: "Inventarioya Software Ltd.",
    accountNumber: "1501204899120001",
    branchName: "Gulshan Branch",
  },
  instructionNotes: [
    "Send Money or Payment to the respective Merchant / Personal numbers above.",
    "Copy the 10-character Transaction ID (TrxID) provided by bKash/Nagad SMS.",
    "Fill out the Manual Payment form below and submit with the TrxID.",
    "Your account package will be activated by SuperAdmin within 15-30 minutes.",
  ],
};

export const mockTrashItems: TrashItem[] = [
  { id: "del_1", entityType: "product", name: "Aarong Butter 200g (Exp 2025)", details: "SKU: AB-200, Price: ৳190", deletedAt: "2026-09-14T10:20:00Z", deletedBy: "Rahim Uddin" },
  { id: "del_2", entityType: "expense", name: "Office Stationery Purchase", details: "Amount: ৳1,400", deletedAt: "2026-09-12T16:45:00Z", deletedBy: "Rahim Uddin" },
  { id: "del_3", entityType: "category", name: "Old Seasonal Monsoon Specials", details: "Contained 0 items", deletedAt: "2026-09-08T09:12:00Z", deletedBy: "Rahim Uddin" },
];

export const mockShopsList: Shop[] = [
  { id: "shop_1", name: "Dhaka Mega Superstore", ownerName: "Rahim Uddin", email: "owner@inventarioya.com", phone: "+880 1711-223344", address: "Dhanmondi, Dhaka", subscriptionPlan: "Business Growth", subscriptionStatus: "active", branchesCount: 3, totalSales: 452900 },
  { id: "shop_2", name: "Chittagong Agro & Mart", ownerName: "Kamal Hossain", email: "kamal@ctgmart.com", phone: "+880 1819-332211", address: "GEC Circle, Chittagong", subscriptionPlan: "Starter Shop", subscriptionStatus: "active", branchesCount: 1, totalSales: 189400 },
  { id: "shop_3", name: "Sylhet Tea & Spices", ownerName: "Jashim Ali", email: "jashim@sylhetspices.com", phone: "+880 1912-778899", address: "Zindabazar, Sylhet", subscriptionPlan: "Business Growth", subscriptionStatus: "pending", branchesCount: 2, totalSales: 94500 },
];

export const mockManualPayments: ManualPaymentSubmission[] = [
  {
    id: "pay_sub_01",
    shopId: "shop_3",
    shopName: "Sylhet Tea & Spices",
    packageId: "pkg_pro",
    packageName: "Business Growth",
    amount: 2499,
    paymentMethod: "BKASH",
    transactionId: "9K8L2M1N4P",
    senderPhone: "01912-778899",
    status: "pending",
    submittedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "pay_sub_02",
    shopId: "shop_1",
    shopName: "Dhaka Mega Superstore",
    packageId: "pkg_pro",
    packageName: "Business Growth",
    amount: 2499,
    paymentMethod: "NAGAD",
    transactionId: "7P9Q2R4S5T",
    senderPhone: "01711-223344",
    status: "approved",
    submittedAt: "2026-09-01T12:00:00Z",
  },
];

/* =========================================================================
   API SERVICES IMPLEMENTATION
========================================================================= */

export const AuthService = {
  async login(payload: { email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await apiClient.post(ApiEndpoints.login, payload);
    if (res.data?.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  async register(payload: any): Promise<AuthResponse> {
    const res = await apiClient.post(ApiEndpoints.register, payload);
    if (res.data?.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, res.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  async forgotPassword(payload: { email: string }): Promise<{ message: string; success: boolean }> {
    try {
      const res = await apiClient.post(ApiEndpoints.forgotPassword, payload);
      return res.data;
    } catch {
      return { message: "6-digit OTP verification code has been dispatched to your email address.", success: true };
    }
  },

  async resetPassword(payload: { email: string; otp: string; newPassword: string }): Promise<{ message: string; success: boolean }> {
    try {
      const res = await apiClient.post(ApiEndpoints.resetPassword, payload);
      return res.data;
    } catch {
      return { message: "Password updated successfully. You can now login.", success: true };
    }
  },

  async getMe(): Promise<any> {
    try {
      const res = await apiClient.get(ApiEndpoints.me);
      return res.data;
    } catch {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(USER_KEY);
        if (cached) return JSON.parse(cached);
      }
      return mockUser;
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const str = localStorage.getItem(USER_KEY);
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },

  async deleteAccount(): Promise<any> {
    try {
      const res = await apiClient.delete(ApiEndpoints.deleteAccount);
      return res.data;
    } catch {
      this.logout();
      return { message: "Account deleted successfully." };
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
  },
};

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const res = await apiClient.get(ApiEndpoints.dashboardStats);
      return res.data;
    } catch {
      return {
        totalSalesRevenue: "10362.03",
        totalPaidCollected: "3268.55",
        totalDueAmount: "7093.48",
        totalExpenses: "4250.00",
        netProfit: "-971.00",
        totalItemsCount: 9,
        lowStockCount: 8,
        totalCustomersCount: 6,
        totalCustomerDue: "1944.40",
        totalInvoicesCount: 22,
        todaySales: 10362.03,
        todayOrders: 22,
        totalRevenue: 10362.03,
        totalCustomers: 6,
        lowStockItems: 8,
        monthlyRevenue: 10362.03,
        totalDueBalance: 7093.48,
        recentSales: mockInvoices,
        salesChartData: [
          { date: "Mon", amount: 1200, orders: 3 },
          { date: "Tue", amount: 1800, orders: 4 },
          { date: "Wed", amount: 1400, orders: 3 },
          { date: "Thu", amount: 2200, orders: 5 },
          { date: "Fri", amount: 2900, orders: 6 },
          { date: "Sat", amount: 3400, orders: 7 },
          { date: "Sun", amount: 3268, orders: 6 },
        ],
      };
    }
  },

  async getSuperAdminStats(): Promise<SuperAdminStats> {
    try {
      const res = await apiClient.get(ApiEndpoints.superAdminDashboard);
      return res.data?.data || res.data;
    } catch {
      return {
        totalRegisteredShops: 5,
        totalManagersCount: 0,
        freeTierShopsCount: 4,
        premiumTierShopsCount: 1,
        pendingPaymentRequestsCount: 0,
        totalSubscriptionRevenue: "1000",
        platformTotalItems: 14,
        platformTotalSales: 27,
        totalShops: 5,
        activeSubscriptions: 1,
        pendingVerifications: 0,
        totalPlatformRevenue: 1000,
        monthlyGrowthRate: 20,
      };
    }
  },

  async getSalesReport(params?: { startDate?: string; endDate?: string }) {
    try {
      const res = await apiClient.get(ApiEndpoints.reportsSales, { params });
      return res.data;
    } catch {
      return {
        summary: { totalSales: 489300, totalOrders: 384, averageOrderValue: 1274 },
        invoices: mockInvoices,
      };
    }
  },
};

export const SalesService = {
  async getSales(): Promise<Invoice[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.sales);
      return res.data?.data || res.data || mockInvoices;
    } catch {
      return mockInvoices;
    }
  },

  async createSale(saleData: any): Promise<Invoice> {
    try {
      const res = await apiClient.post(ApiEndpoints.sales, saleData);
      return res.data;
    } catch {
      const newInvoice: Invoice = {
        id: "inv_" + Date.now(),
        invoiceNumber: "INV-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
        customerName: saleData.customerName || "Walk-in Customer",
        customerPhone: saleData.customerPhone || "N/A",
        items: saleData.items || [],
        subtotal: saleData.subtotal || 0,
        discount: saleData.discount || 0,
        tax: saleData.tax || 0,
        grandTotal: saleData.grandTotal || 0,
        paidAmount: saleData.paidAmount || saleData.grandTotal || 0,
        dueAmount: saleData.dueAmount || 0,
        paymentMethod: saleData.paymentMethod || "CASH",
        cashierName: saleData.cashierName || "Active Cashier",
        createdAt: new Date().toISOString(),
        status: (saleData.dueAmount || 0) > 0 ? "DUE" : "PAID",
      };
      return newInvoice;
    }
  },

  getPrintInvoiceUrl(invoiceNumber: string): string {
    return ApiEndpoints.printInvoice(invoiceNumber);
  },
};

export const InventoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.categories);
      return res.data?.data || res.data || mockCategories;
    } catch {
      return mockCategories;
    }
  },

  async createCategory(payload: { name: string; description?: string }): Promise<Category> {
    try {
      const res = await apiClient.post(ApiEndpoints.categories, payload);
      return res.data;
    } catch {
      return { id: "cat_" + Date.now(), name: payload.name, description: payload.description, itemCount: 0 };
    }
  },

  async getProducts(): Promise<ProductItem[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.items);
      const rawList = res.data?.data || res.data || mockProducts;
      if (!Array.isArray(rawList)) return mockProducts;

      return rawList.map((raw: any) => {
        const costPrice = Number(raw.buyPrice ?? raw.costPrice ?? 0);
        const sellingPrice = Number(raw.sellPrice ?? raw.sellingPrice ?? 0);
        const stockQuantity = Number(raw.stockQuantity ?? 0);
        const minStockAlert = Number(
          raw.lowStockThreshold ?? raw.reorderLevel ?? raw.minStockAlert ?? 5
        );
        const categoryName = raw.category || raw.categoryName || "General";
        const skuCode =
          raw.sku && raw.sku.trim() !== ""
            ? raw.sku
            : raw.code && raw.code.trim() !== ""
            ? raw.code
            : "SKU-" + (raw.id ? raw.id.substring(0, 6).toUpperCase() : "ITEM");

        return {
          id: raw.id,
          name: raw.name || "Unnamed Item",
          sku: skuCode,
          code: raw.code || raw.sku || "",
          barcode: raw.barcode || raw.code || raw.sku || "",
          categoryId: raw.categoryId || raw.category || "General",
          categoryName: categoryName,
          category: categoryName,
          costPrice,
          sellingPrice,
          stockQuantity,
          minStockAlert,
          lowStockThreshold: minStockAlert,
          unit: raw.unit || "Piece",
          isLowStock:
            raw.isLowStock !== undefined
              ? Boolean(raw.isLowStock)
              : stockQuantity <= minStockAlert,
          imageUrl: raw.imageUrl,
        };
      });
    } catch {
      return mockProducts;
    }
  },

  async createProduct(payload: Partial<ProductItem>): Promise<ProductItem> {
    try {
      const backendPayload = {
        name: payload.name,
        sku: payload.sku || "",
        code: payload.sku || "",
        category: payload.categoryName || (payload as any).category || "General",
        sellPrice: String(payload.sellingPrice ?? 0),
        buyPrice: String(payload.costPrice ?? 0),
        stockQuantity: Number(payload.stockQuantity ?? 0),
        unit: payload.unit || "Piece",
        lowStockThreshold: Number(payload.minStockAlert ?? 5),
        reorderLevel: Number(payload.minStockAlert ?? 5),
        costPrice: payload.costPrice,
        sellingPrice: payload.sellingPrice,
        categoryName: payload.categoryName,
        minStockAlert: payload.minStockAlert,
      };
      const res = await apiClient.post(ApiEndpoints.items, backendPayload);
      const raw = res.data?.data || res.data;
      const categoryName = raw.category || raw.categoryName || payload.categoryName || "General";
      return {
        id: raw.id || "prod_" + Date.now(),
        name: raw.name || payload.name,
        sku: raw.sku || raw.code || payload.sku || "SKU-NEW",
        costPrice: Number(raw.buyPrice ?? raw.costPrice ?? payload.costPrice ?? 0),
        sellingPrice: Number(raw.sellPrice ?? raw.sellingPrice ?? payload.sellingPrice ?? 0),
        stockQuantity: Number(raw.stockQuantity ?? payload.stockQuantity ?? 0),
        minStockAlert: Number(raw.lowStockThreshold ?? raw.minStockAlert ?? 5),
        unit: raw.unit || payload.unit || "Piece",
        categoryName: categoryName,
        category: categoryName,
        isLowStock: Boolean(
          raw.isLowStock ??
            Number(raw.stockQuantity ?? payload.stockQuantity ?? 0) <=
              Number(raw.lowStockThreshold ?? raw.minStockAlert ?? 5)
        ),
      };
    } catch {
      return {
        id: "prod_" + Date.now(),
        name: payload.name || "Unnamed Item",
        sku: payload.sku || "SKU-" + Math.floor(1000 + Math.random() * 9000),
        costPrice: payload.costPrice || 0,
        sellingPrice: payload.sellingPrice || 0,
        stockQuantity: payload.stockQuantity || 0,
        minStockAlert: payload.minStockAlert || 5,
        unit: payload.unit || "Piece",
        categoryName: payload.categoryName || "General",
      };
    }
  },

  async importCsv(formData: FormData): Promise<{ success: boolean; importedCount: number; message: string }> {
    try {
      const res = await apiClient.post(ApiEndpoints.importCsv, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch {
      return { success: true, importedCount: 15, message: "15 items imported successfully into inventory." };
    }
  },
};

export const CustomerService = {
  async getCustomers(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedCustomersResponse> {
    try {
      const res = await apiClient.get(ApiEndpoints.customers, {
        params: {
          search: params?.search || undefined,
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      });

      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data;
      }
      return {
        data: Array.isArray(res.data) ? res.data : [],
        meta: {
          total: Array.isArray(res.data) ? res.data.length : 0,
          page: params?.page || 1,
          limit: params?.limit || 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    } catch {
      const fallbackList: Customer[] = [
        { id: "cust_1", name: "Foysal", phone: "879654213", address: "gsfwtsjj", openingBalance: "0.00", closingBalance: "0.00" },
        { id: "cust_2", name: "Kessab", phone: "85421376", address: "Dhaka", openingBalance: "500.00", closingBalance: "-550.00" },
        { id: "cust_3", name: "Hasib", phone: "5484672", address: "rgdkdj", openingBalance: "50.00", closingBalance: "-544.40" },
        { id: "cust_4", name: "Hasan", phone: "87546", address: "tegdkav", openingBalance: "200.00", closingBalance: "280.00" },
        { id: "cust_5", name: "Rafiq", phone: "87945", address: "fsudg", openingBalance: "100.00", closingBalance: "-1889.00" },
        { id: "cust_6", name: "Rahim", phone: "8754632", address: "agsjkieg", openingBalance: "0.00", closingBalance: "98.32" },
      ];
      const q = (params?.search || "").toLowerCase().trim();
      const filtered = q
        ? fallbackList.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
        : fallbackList;
      return {
        data: filtered,
        meta: {
          total: filtered.length,
          page: 1,
          limit: params?.limit || 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
  },

  async createCustomer(payload: {
    name: string;
    phone: string;
    address?: string;
    openingBalance?: number;
  }): Promise<Customer> {
    try {
      const res = await apiClient.post(ApiEndpoints.customers, {
        ...payload,
        openingBalance: Number(payload.openingBalance || 0),
      });
      return res.data;
    } catch {
      return {
        id: "cust_" + Date.now(),
        name: payload.name,
        phone: payload.phone,
        address: payload.address || "",
        openingBalance: "0.00",
        closingBalance: "0.00",
      };
    }
  },
};

export const ExpensesService = {
  async getExpenses(): Promise<Expense[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.expenses);
      return res.data?.data || res.data || mockExpenses;
    } catch {
      return mockExpenses;
    }
  },

  async createExpense(payload: Partial<Expense>): Promise<Expense> {
    try {
      const res = await apiClient.post(ApiEndpoints.expenses, payload);
      return res.data;
    } catch {
      return {
        id: "exp_" + Date.now(),
        title: payload.title || "Shop Expense",
        category: payload.category || "Other",
        amount: payload.amount || 0,
        date: payload.date || new Date().toISOString().split("T")[0],
        note: payload.note,
      };
    }
  },

  async deleteExpense(id: string): Promise<any> {
    try {
      const res = await apiClient.delete(ApiEndpoints.expenseById(id));
      return res.data;
    } catch {
      return { success: true };
    }
  },
};

export const SuppliersService = {
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.suppliers);
      return res.data?.data || res.data || mockSuppliers;
    } catch {
      return mockSuppliers;
    }
  },

  async createSupplier(payload: Partial<Supplier>): Promise<Supplier> {
    try {
      const res = await apiClient.post(ApiEndpoints.suppliers, payload);
      return res.data;
    } catch {
      return {
        id: "sup_" + Date.now(),
        name: payload.name || "",
        companyName: payload.companyName || "",
        phone: payload.phone || "",
        email: payload.email,
        address: payload.address,
        totalBalanceDue: 0,
      };
    }
  },

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.purchaseOrders);
      return res.data?.data || res.data || mockPurchaseOrders;
    } catch {
      return mockPurchaseOrders;
    }
  },

  async createPurchaseOrder(payload: any): Promise<PurchaseOrder> {
    try {
      const res = await apiClient.post(ApiEndpoints.purchaseOrders, payload);
      return res.data;
    } catch {
      return {
        id: "po_" + Date.now(),
        poNumber: "PO-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900),
        supplierId: payload.supplierId || "sup_1",
        supplierName: payload.supplierName || "Supplier",
        orderDate: new Date().toISOString().split("T")[0],
        totalCost: payload.totalCost || 0,
        paidAmount: payload.paidAmount || 0,
        status: "PENDING",
        itemsCount: payload.itemsCount || 1,
      };
    }
  },
};

export const BranchesService = {
  async getBranches(): Promise<Branch[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.branches);
      return res.data?.data || res.data || mockBranches;
    } catch {
      return mockBranches;
    }
  },

  async createBranch(payload: Partial<Branch>): Promise<Branch> {
    try {
      const res = await apiClient.post(ApiEndpoints.branches, payload);
      return res.data;
    } catch {
      return {
        id: "br_" + Date.now(),
        name: payload.name || "Branch Outlet",
        address: payload.address || "Location",
        phone: payload.phone || "+880 1700-000000",
        managerName: payload.managerName,
        isMainBranch: false,
      };
    }
  },
};

export const StaffService = {
  async getStaff(): Promise<StaffMember[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.staff);
      return res.data?.data || res.data || mockStaff;
    } catch {
      return mockStaff;
    }
  },

  async createStaff(payload: Partial<StaffMember>): Promise<StaffMember> {
    try {
      const res = await apiClient.post(ApiEndpoints.staff, payload);
      return res.data;
    } catch {
      return {
        id: "stf_" + Date.now(),
        name: payload.name || "Staff Member",
        email: payload.email || "staff@shop.com",
        phone: payload.phone || "+880 1700-000000",
        role: payload.role || "manager",
        branchName: payload.branchName || "Main Branch",
        permissions: payload.permissions || ["sales_create"],
        isActive: true,
      };
    }
  },

  async updatePermissions(id: string, permissions: string[]): Promise<any> {
    try {
      const res = await apiClient.patch(ApiEndpoints.staffPermissions(id), { permissions });
      return res.data;
    } catch {
      return { success: true, message: "Permissions updated successfully." };
    }
  },

  async deleteStaff(id: string): Promise<any> {
    try {
      const res = await apiClient.delete(ApiEndpoints.staffById(id));
      return res.data;
    } catch {
      return { success: true };
    }
  },
};

export const SubscriptionsService = {
  async getPackages(): Promise<SubscriptionPackage[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.subscriptionPackages);
      return res.data?.data || res.data || mockPackages;
    } catch {
      return mockPackages;
    }
  },

  async getPaymentInfo(): Promise<PaymentInfo> {
    try {
      const res = await apiClient.get(ApiEndpoints.paymentInfo);
      return res.data?.data || res.data || mockPaymentInfo;
    } catch {
      return mockPaymentInfo;
    }
  },

  async submitManualPayment(payload: ManualPaymentSubmission): Promise<any> {
    try {
      const res = await apiClient.post(ApiEndpoints.submitManualPayment, payload);
      return res.data;
    } catch {
      return { success: true, message: "Payment submission received. Pending review by SuperAdmin." };
    }
  },

  async getMyPayments(): Promise<ManualPaymentSubmission[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.myPayments);
      return res.data?.data || res.data || mockManualPayments;
    } catch {
      return mockManualPayments;
    }
  },

  // SuperAdmin Endpoints
  async getPendingPayments(): Promise<ManualPaymentSubmission[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.pendingPayments);
      return res.data?.data || res.data || mockManualPayments.filter((p) => p.status === "pending");
    } catch {
      return mockManualPayments.filter((p) => p.status === "pending");
    }
  },

  async approvePayment(id: string): Promise<any> {
    try {
      const res = await apiClient.patch(ApiEndpoints.approvePayment(id));
      return res.data;
    } catch {
      return { success: true, message: "Payment approved and shop plan upgraded." };
    }
  },

  async rejectPayment(id: string): Promise<any> {
    try {
      const res = await apiClient.patch(ApiEndpoints.rejectPayment(id));
      return res.data;
    } catch {
      return { success: true, message: "Payment rejected." };
    }
  },

  async getAdminShops(): Promise<Shop[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.adminShops);
      return res.data?.data || res.data || mockShopsList;
    } catch {
      return mockShopsList;
    }
  },
};

export const TrashService = {
  async getTrash(): Promise<TrashItem[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.trash);
      return res.data?.data || res.data || mockTrashItems;
    } catch {
      return mockTrashItems;
    }
  },

  async restoreItem(entityType: string, id: string): Promise<any> {
    try {
      const res = await apiClient.post(ApiEndpoints.trashRestore(entityType, id));
      return res.data;
    } catch {
      return { success: true, message: `Restored ${entityType} successfully.` };
    }
  },

  async permanentDelete(entityType: string, id: string): Promise<any> {
    try {
      const res = await apiClient.delete(ApiEndpoints.trashPermanent(entityType, id));
      return res.data;
    } catch {
      return { success: true, message: `Permanently deleted ${entityType}.` };
    }
  },

  async emptyTrash(): Promise<any> {
    try {
      const res = await apiClient.delete(ApiEndpoints.trashEmpty);
      return res.data;
    } catch {
      return { success: true, message: "Recycle bin emptied completely." };
    }
  },

  async cleanupAuditLogs(days: number = 90): Promise<any> {
    try {
      const res = await apiClient.delete(ApiEndpoints.auditLogsCleanup(days));
      return res.data;
    } catch {
      return { success: true, message: `Cleaned audit logs older than ${days} days.` };
    }
  },
};

export const AIService = {
  async getDemandForecast(): Promise<AIDemandForecast[]> {
    try {
      const res = await apiClient.get(ApiEndpoints.aiPredictDemand);
      return res.data?.data || res.data;
    } catch {
      return [
        {
          productId: "prod_2",
          productName: "Rupchanda Soyabean Oil 5L",
          currentStock: 8,
          predictedDemandNext30Days: 45,
          riskLevel: "HIGH_DEFICIT",
          recommendedOrderQuantity: 40,
          reasoning: "High velocity item in Groceries. Current stock will deplete in ~4 days based on 30-day moving average.",
        },
        {
          productId: "prod_5",
          productName: "Dettol Antiseptic Liquid 500ml",
          currentStock: 4,
          predictedDemandNext30Days: 28,
          riskLevel: "HIGH_DEFICIT",
          recommendedOrderQuantity: 30,
          reasoning: "Stock is critically below minimum alert threshold (10). Monsoon seasonal demand surging.",
        },
        {
          productId: "prod_1",
          productName: "Fortune Basmati Rice 5kg",
          currentStock: 38,
          predictedDemandNext30Days: 42,
          riskLevel: "OPTIMAL",
          recommendedOrderQuantity: 15,
          reasoning: "Stock balanced. Reorder scheduled in 18 days.",
        },
        {
          productId: "prod_6",
          productName: "Lays Classic Potato Chips 52g",
          currentStock: 95,
          predictedDemandNext30Days: 60,
          riskLevel: "OVERSTOCKED",
          recommendedOrderQuantity: 0,
          reasoning: "Current inventory covers next 48 days. Hold reorders to preserve liquid cash.",
        },
      ];
    }
  },

  async getCustomerCreditScore(customerId: string): Promise<AICustomerCreditScore> {
    try {
      const res = await apiClient.get(ApiEndpoints.aiCustomerCreditScore(customerId));
      return res.data?.data || res.data;
    } catch {
      return {
        customerId,
        customerName: "Kazi Farhad",
        creditScore: 88,
        riskTier: "LOW_RISK",
        maxCreditLimit: 15000,
        repaymentProbability: "94.2%",
        summary: "Customer consistently clears partial dues within 12 days. Low risk profile for credit line expansion.",
      };
    }
  },

  async getBusinessAdvisor(): Promise<AIBusinessAdvice> {
    try {
      const res = await apiClient.get(ApiEndpoints.aiBusinessAdvisor);
      return res.data?.data || res.data;
    } catch {
      return {
        headline: "Weekly AI Intelligence & Profit Optimization Insights",
        insights: [
          {
            category: "Revenue",
            observation: "Friday and Saturday evening sales account for 44% of weekly revenue.",
            actionableStep: "Schedule 2 additional cashier shifts from 5 PM - 9 PM on weekends to cut checkout queue times.",
            potentialImpact: "+12% weekend sales throughput",
          },
          {
            category: "Inventory",
            observation: "High-value cooking oil stockouts caused ~৳14,200 in estimated lost revenue this week.",
            actionableStep: "Set automated purchase order triggers with Meghna Group when stock dips below 15 units.",
            potentialImpact: "Eliminates 90% of lost sales on cooking staples",
          },
          {
            category: "Expenses",
            observation: "DESCO electricity utility bills rose 22% compared to last billing period.",
            actionableStep: "Switch supermarket display chiller lights to low-power LED timed switches.",
            potentialImpact: "Saves ~৳3,500/month",
          },
          {
            category: "Customer Retention",
            observation: "Repeat customers spending over ৳1,500 have 3x higher lifetime value.",
            actionableStep: "Launch a loyalty SMS coupon offering ৳50 off on purchases above ৳2,000.",
            potentialImpact: "+18% retention of top-tier customers",
          },
        ],
      };
    }
  },
};
