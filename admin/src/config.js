/**
 * Admin Dashboard Configuration
 *
 * This file serves as the central configuration for the admin dashboard.
 * As the application grows, add new configuration sections here.
 */

export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    timeout: 10000,
    withCredentials: true,
  },

  // Pagination
  pagination: {
    pageSize: 20,
  },

  // Transaction Status Colors
  statusColors: {
    PENDING: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      badge: "bg-yellow-100",
    },
    APPROVED: {
      bg: "bg-green-50",
      text: "text-green-800",
      badge: "bg-green-100",
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-800",
      badge: "bg-red-100",
    },
  },

  // Toast Notifications
  toast: {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },

  // Transaction Filters
  filters: {
    statuses: ["PENDING", "APPROVED", "REJECTED", "ALL"],
    defaultFilter: "PENDING",
  },

  // Feature Flags (for future features)
  features: {
    enableTransactionComments: false,
    enableBulkOperations: false,
    enableExports: false,
    enableAuditLogs: false,
  },
};

export default config;
