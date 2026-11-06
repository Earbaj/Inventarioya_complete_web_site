import { useState, useEffect } from "react";
import { Customer } from "@/types";
import { CustomerService } from "@/lib/api/client";

/**
 * পিওএস কাস্টমার সার্চ, ড্রপডাউন ও নতুন কাস্টমার তৈরির কাস্টম হুক (POS Customers Hook)
 * কাস্টমার লোড, ডিব্যউন্স সার্চ, পেজিনেশন এবং ফর্ম সাবমিশন পরিচালনা করে।
 */
export function usePosCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerMeta, setCustomerMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  }>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
  });

  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingMoreCustomers, setIsLoadingMoreCustomers] = useState(false);

  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    phone: "",
    address: "",
    openingBalance: 0,
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");

  // কাস্টমার ফেচিং ও পেজিনেশন
  const fetchCustomers = async (search = "", page = 1, append = false) => {
    if (append) {
      setIsLoadingMoreCustomers(true);
    } else {
      setIsLoadingCustomers(true);
    }

    try {
      const res = await CustomerService.getCustomers({ search, page, limit: 20 });
      if (append) {
        setCustomers((prev) => [...prev, ...res.data]);
      } else {
        setCustomers(res.data);
      }
      setCustomerMeta(res.meta);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setIsLoadingCustomers(false);
      setIsLoadingMoreCustomers(false);
    }
  };

  // ডিব্যউন্সড সার্চ
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(customerSearch, 1, false);
    }, 280);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  const loadMoreCustomers = () => {
    if (!customerMeta.hasNextPage || isLoadingMoreCustomers) return;
    fetchCustomers(customerSearch, customerMeta.page + 1, true);
  };

  const handleSelectCustomer = (cust: Customer | null) => {
    if (cust) {
      setSelectedCustomer(cust);
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone || "");
    } else {
      setSelectedCustomer(null);
      setCustomerName("Walk-in Customer");
      setCustomerPhone("");
    }
    setIsCustomerDropdownOpen(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) return;
    setIsCreatingCustomer(true);

    try {
      const created = await CustomerService.createCustomer({
        name: newCustomerForm.name,
        phone: newCustomerForm.phone,
        address: newCustomerForm.address,
        openingBalance: Number(newCustomerForm.openingBalance || 0),
      });

      setCustomers((prev) => [created, ...prev]);
      handleSelectCustomer(created);
      setShowAddCustomerModal(false);
      setNewCustomerForm({ name: "", phone: "", address: "", openingBalance: 0 });
    } catch (err) {
      console.error("Failed to create customer", err);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  return {
    customers,
    setCustomers,
    customerMeta,
    setCustomerMeta,
    customerSearch,
    setCustomerSearch,
    isCustomerDropdownOpen,
    setIsCustomerDropdownOpen,
    selectedCustomer,
    setSelectedCustomer,
    isLoadingCustomers,
    isLoadingMoreCustomers,
    loadMoreCustomers,
    handleSelectCustomer,
    showAddCustomerModal,
    setShowAddCustomerModal,
    newCustomerForm,
    setNewCustomerForm,
    isCreatingCustomer,
    handleCreateCustomer,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
  };
}
