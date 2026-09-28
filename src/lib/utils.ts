export const formatCurrency = (value: number, symbol = "₹"): string => {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${symbol}${formatted}`;
};

export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const getOrderStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING_PAYMENT: "#FFA500",
    CONFIRMED: "#4F46E5",
    PREPARING: "#7C3AED",
    OUT_FOR_DELIVERY: "#06B6D4",
    DELIVERED: "#10B981",
    CANCELLED: "#EF4444",
    FAILED: "#EF4444",
  };
  return colors[status] || "#6B7280";
};

export const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Payment pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
  };
  return labels[status] || status;
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "").slice(-10);
  if (cleaned.length !== 10) return phone;
  return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
