import React from "react";
import { toast } from "react-toastify";
import api from "../apiInterceptor";

const PurchaseTransaction = ({ request, onApprove, onReject, isLoading }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isPending = request.status === "PENDING";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Header with status */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-600 font-medium">Request ID</p>
            <p className="text-lg font-mono text-gray-900">
              {request.request_id}
            </p>
          </div>
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(request.status)}`}
          >
            {request.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {/* Vendor Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm font-medium mb-1">Vendor</p>
            <p className="text-lg font-semibold text-gray-900">
              {request.vendor?.name || "Unknown Vendor"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {request.vendor?.email || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              {request.vendor?.mobile || "N/A"}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <p className="text-gray-600 text-sm font-medium mb-1">
              Points Requested
            </p>
            <p className="text-3xl font-bold text-indigo-600">
              {request.points}
            </p>
          </div>
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-600 font-medium">Vendor ID</p>
            <p className="text-gray-900 font-mono text-xs mt-1 truncate">
              {request.vendor_id}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Created At</p>
            <p className="text-gray-900 mt-1">
              {formatDate(request.created_at)}
            </p>
          </div>
          {request.approved_at && (
            <div>
              <p className="text-gray-600 font-medium">Processed At</p>
              <p className="text-gray-900 mt-1">
                {formatDate(request.approved_at)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isPending && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => onApprove(request.request_id)}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? "Processing..." : "✓ Approve"}
          </button>
          <button
            onClick={() => onReject(request.request_id)}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? "Processing..." : "✕ Reject"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PurchaseTransaction;
