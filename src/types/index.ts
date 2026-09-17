export type UserRole = "superadmin" | "admin" | "manager";

export interface UserPermissions {
  canProcessReturn?: boolean;
  canExportExcel?: boolean;
  canEditCustomers?: boolean;
  canViewBuyPrice?: boolean;
  [key: string]: any;
}

export interface User {
  id?: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  shopId?: string;
  shopName?: string;
  branchId?: string;
  subscriptionTier?: "free" | "standard" | "premium" | string;
  subscriptionExpiresAt?: string;
  permissions?: UserPermissions;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  shop?: Shop;
}

export interface Shop {
  id: string;
  shopId?: string;
  name: string;
  ownerName?: string;
  email: string;
  phone?: string;
  role?: string;
  address?: string;
  logoUrl?: string;
  subscriptionTier?: "free" | "standard" | "premium" | string;
  subscriptionPlan?: string;
  subscriptionStatus?: "active" | "trial" | "expired" | "pending";
  subscriptionExpiresAt?: string | null;
  expiresAt?: string;
  managerCount?: number;
  branchesCount?: number;
  totalSales?: number;
  createdAt?: string;
}

export interface DashboardStats {
  // Direct backend response keys from /api/dashboard/stats:
  totalSalesRevenue?: string | number;
  totalPaidCollected?: string | number;
  totalDueAmount?: string | number;
  totalExpenses?: string | number;
  netProfit?: string | number;
  totalItemsCount?: number;
  lowStockCount?: number;
  totalCustomersCount?: number;
  totalCustomerDue?: string | number;
  totalInvoicesCount?: number;

  // Fallbacks & chart data:
  todaySales?: number;
  todayOrders?: number;
  totalRevenue?: number;
  totalCustomers?: number;
  lowStockItems?: number;
  monthlyRevenue?: number;
  totalDueBalance?: number;
  recentSales?: Invoice[];
  salesChartData?: { date: string; amount: number; orders: number }[];
}

export interface SuperAdminStats {
  // Direct backend keys from /api/dashboard/superadmin:
  totalRegisteredShops?: number;
  totalManagersCount?: number;
  freeTierShopsCount?: number;
  premiumTierShopsCount?: number;
  pendingPaymentRequestsCount?: number;
  totalSubscriptionRevenue?: string | number;
  platformTotalItems?: number;
  platformTotalSales?: number;

  // Fallback compatibility keys:
  totalShops?: number;
  activeSubscriptions?: number;
  pendingVerifications?: number;
  totalPlatformRevenue?: number;
  monthlyGrowthRate?: number;
  recentRegistrations?: Shop[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
  createdAt?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  code?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  category?: string;
  costPrice: number;
  sellingPrice: number;
  sellPrice?: string | number;
  buyPrice?: string | number;
  stockQuantity: number;
  minStockAlert: number;
  lowStockThreshold?: number;
  reorderLevel?: number;
  isLowStock?: boolean;
  unit: string; // e.g. "pcs", "kg", "box"
  imageUrl?: string;
}

export interface CartItem extends ProductItem {
  cartQuantity: number;
  discount: number; // percentage or fixed
  lineTotal: number;
}

export interface InvoiceItem {
  productId?: string;
  itemId?: string;
  productName?: string;
  name?: string;
  quantity: number;
  price?: number;
  unitPrice?: number | string;
  discount?: number | string;
  discountType?: "amount" | "percentage" | string;
  total?: number;
  totalPrice?: number | string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceNo?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  originalSubtotal?: number | string;
  discount: number;
  tax?: number;
  grandTotal: number;
  originalGrandTotal?: number | string;
  netGrandTotal?: number | string;
  netTotal?: number;
  totalRefunded?: number | string;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: "CASH" | "CARD" | "BKASH" | "NAGAD" | "BANK" | "DUE" | string;
  paymentStatus?: "paid" | "due" | "partial" | string;
  cashierName: string;
  createdByName?: string;
  createdByRole?: string;
  servedBy?: {
    id?: string;
    name?: string;
    role?: string;
  };
  branchId?: string | null;
  branchName?: string;
  createdAt: string;
  date?: string;
  status: "PAID" | "PARTIAL" | "DUE" | "REFUNDED" | string;
  isReturned?: "none" | "partial" | "full" | string;
}

export interface Expense {
  id: string;
  title: string;
  category: "Rent" | "Salary" | "Utilities" | "Inventory" | "Marketing" | "Maintenance" | "Other";
  amount: number;
  date: string;
  note?: string;
  branchId?: string;
  recordedBy?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address?: string;
  totalBalanceDue: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  deliveryDate?: string;
  totalCost: number;
  paidAmount: number;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  itemsCount: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName?: string;
  isMainBranch?: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager";
  branchId?: string;
  branchName?: string;
  permissions: string[];
  isActive: boolean;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
  maxBranches: number;
  maxStaff: number;
  hasAIFeatures: boolean;
}

export interface PaymentInfo {
  merchantName: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  bankAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName: string;
  };
  instructionNotes?: string[];
}

export interface ManualPaymentSubmission {
  id?: string;
  shopId?: string;
  shopName?: string;
  packageId: string;
  packageName?: string;
  amount: number;
  paymentMethod: "BKASH" | "NAGAD" | "ROCKET" | "BANK";
  transactionId: string;
  senderPhone?: string;
  screenshotUrl?: string;
  status?: "pending" | "approved" | "rejected";
  submittedAt?: string;
}

export interface TrashItem {
  id: string;
  entityType: "product" | "category" | "expense" | "supplier" | "sale" | "customer";
  name: string;
  details?: string;
  deletedAt: string;
  deletedBy?: string;
}

export interface AIDemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemandNext30Days: number;
  riskLevel: "HIGH_DEFICIT" | "OPTIMAL" | "OVERSTOCKED";
  recommendedOrderQuantity: number;
  reasoning: string;
}

export interface AICustomerCreditScore {
  customerId: string;
  customerName: string;
  creditScore: number; // 0 - 100
  riskTier: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK";
  maxCreditLimit: number;
  repaymentProbability: string;
  summary: string;
}

export interface AIBusinessAdvice {
  headline: string;
  insights: {
    category: "Revenue" | "Inventory" | "Expenses" | "Customer Retention";
    observation: string;
    actionableStep: string;
    potentialImpact: string;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  openingBalance?: string | number;
  closingBalance?: string | number;
  totalPurchases?: number;
  totalDue?: number;
  createdAt?: string;
}

export interface PaginatedCustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaginatedSalesResponse {
  data: Invoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

