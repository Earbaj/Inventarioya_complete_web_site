import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined | null, currency: string = "৳"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount || 0);
  return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function downloadCsvFile(data: any[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        let val = obj[header];
        if (typeof val === "object" && val !== null) val = JSON.stringify(val);
        const str = String(val ?? "").replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function extractPersonName(user: any, fallbackShopName?: string): string {
  if (!user) return "Admin";
  if (user.ownerName) return user.ownerName;
  if (user.operatorName) return user.operatorName;
  if (user.cashierName) return user.cashierName;

  const shopWords = [
    "shop",
    "store",
    "enterprise",
    "trader",
    "traders",
    "ltd",
    "limited",
    "pos",
    "mart",
    "center",
    "centre",
    "hardware",
    "pharmacy",
    "corp",
    "corporation",
    "inc",
    "co",
    "company",
  ];

  const rawName = (user.name || "").trim();
  const rawNameLower = rawName.toLowerCase();
  const isShopName =
    shopWords.some((w) => rawNameLower.includes(w)) ||
    (fallbackShopName ? rawName === fallbackShopName : false);

  // If user.name does not look like a shop name and is not the shop name
  if (rawName && !isShopName) {
    return rawName;
  }

  // Extract from email (e.g. "earbaj@admin.com" -> "Earbaj", "john.doe@gmail.com" -> "John Doe")
  if (user.email) {
    const prefix = user.email.split("@")[0] || "";
    const clean = prefix.replace(/[._-]/g, " ").replace(/\d+/g, "").trim();
    if (clean) {
      return clean
        .split(" ")
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  // If name has shop words like "Earbaj Shop", filter out shop words
  if (rawName) {
    const parts = rawName.split(" ").filter((p: string) => !shopWords.includes(p.toLowerCase()));
    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  return "Admin";
}
