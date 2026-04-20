import React, { useEffect, useState } from "react";
import { AppData } from "../context/AppContext";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const VendorTransactions = () => {
  const { user } = AppData();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const TRANSACTION_TYPES = {
    ISSUE: "Points Issued",
    REDEEM: "Points Redeemed",
    PURCHASE: "Points Purchased",
    VENDOR_TRANSFER: "Vendor Transfer",
    ALL: "All Transactions",
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/vendor-transactions");
      setTransactions(data.transactions || []);
      applyFilters(data.transactions || [], activeFilter, startDate, endDate);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (txnList, filter, start, end) => {
    let filtered = [...txnList];

    // Filter by type
    if (filter === "ISSUE") {
      filtered = filtered.filter((t) => t.type === "ISSUE");
    } else if (filter === "REDEEM") {
      filtered = filtered.filter((t) => t.type === "REDEEM");
    } else if (filter === "PURCHASE") {
      filtered = filtered.filter((t) => t.type === "PURCHASE");
    } else if (filter === "VENDOR_TRANSFER") {
      filtered = filtered.filter((t) => t.type === "VENDOR_TRANSFER");
    }

    // Filter by date range
    if (start) {
      const startDateTime = new Date(start);
      filtered = filtered.filter(
        (t) => new Date(t.created_at) >= startDateTime,
      );
    }
    if (end) {
      const endDateTime = new Date(end);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter((t) => new Date(t.created_at) <= endDateTime);
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilters(transactions, filter, startDate, endDate);
  };

  const handleDateChange = (field, value) => {
    if (field === "start") {
      setStartDate(value);
      applyFilters(transactions, activeFilter, value, endDate);
    } else {
      setEndDate(value);
      applyFilters(transactions, activeFilter, startDate, value);
    }
  };

  const resetFilters = () => {
    setActiveFilter("ALL");
    setStartDate("");
    setEndDate("");
    setFilteredTransactions(transactions);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "ISSUE":
        return "➕";
      case "REDEEM":
        return "➖";
      case "PURCHASE":
        return "💳";
      case "VENDOR_TRANSFER":
        return "↔️";
      default:
        return "📊";
    }
  };

  const getTransactionLabel = (type) => {
    return TRANSACTION_TYPES[type] || type;
  };

  const getDirectionColor = (direction) => {
    return direction === "CREDIT" ? "text-green-600" : "text-red-600";
  };

  const getDirectionSign = (direction) => {
    return direction === "CREDIT" ? "+" : "-";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Vendor Transaction Ledger
          </h1>
          <p className="text-gray-600">
            View and track all your point transactions
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-indigo-600">
                {transactions.length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Credit Transactions</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter((t) => t.direction === "CREDIT").length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Debit Transactions</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter((t) => t.direction === "DEBIT").length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Points</p>
              <p className="text-2xl font-bold text-purple-600">
                {user?.points ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>

          {/* Transaction Type Filter */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Transaction Type
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(TRANSACTION_TYPES).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`px-4 py-2 rounded transition ${
                    activeFilter === key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Reset Filters
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">
                      Party
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-800">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn, idx) => (
                    <tr
                      key={txn.transaction_id}
                      className={`border-b ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {new Date(txn.created_at).toLocaleDateString()}{" "}
                        <span className="text-xs text-gray-500">
                          {new Date(txn.created_at).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getTransactionIcon(txn.type)}
                          </span>
                          <span className="text-sm font-medium text-gray-800">
                            {getTransactionLabel(txn.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>
                          {txn.point_issuance && (
                            <p>
                              Issued {txn.point_issuance.points_issued} points
                            </p>
                          )}
                          {txn.redemption && (
                            <p>
                              Customer redeemed {txn.redemption.points_used}{" "}
                              points
                            </p>
                          )}
                          {txn.vendor_transfer && (
                            <p>
                              Transferred{" "}
                              {txn.vendor_transfer.points_transferred} points
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <div>
                          <p className="font-medium">
                            {txn.correspondent?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {txn.correspondent?.mobile}
                          </p>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${getDirectionColor(txn.direction)}`}
                      >
                        {getDirectionSign(txn.direction)}
                        {txn.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> This ledger shows all
            transactions where you are the primary actor (vendor). Credit (+)
            means you received points, Debit (-) means you sent points.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorTransactions;
