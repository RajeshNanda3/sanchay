import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../apiInterceptor";
import PurchaseTransaction from "../components/PurchaseTransaction";
import Loading from "../Loading";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("PENDING");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/admin/pending-requests");
      const allTransactions = data.requests || [];
      setTransactions(allTransactions);

      // Calculate stats
      const statsData = {
        pending: allTransactions.filter((t) => t.status === "PENDING").length,
        approved: allTransactions.filter((t) => t.status === "APPROVED").length,
        rejected: allTransactions.filter((t) => t.status === "REJECTED").length,
        totalPoints: allTransactions.reduce((sum, t) => sum + t.points, 0),
      };
      setStats(statsData);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch transactions",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(
        "/api/v1/admin/approve-purchase-request",
        {
          requestId,
        },
      );
      toast.success(data.message);
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(false);
    if (window.confirm("Are you sure you want to reject this request?")) {
      setActionLoading(true);
      try {
        const { data } = await api.post(
          "/api/v1/admin/reject-purchase-request",
          {
            requestId,
          },
        );
        toast.success(data.message);
        fetchTransactions();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to reject request");
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  const filteredTransactions =
    filter === "ALL"
      ? transactions
      : transactions.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage vendor purchase requests</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pending"
            value={stats.pending}
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
            borderColor="border-yellow-200"
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            bgColor="bg-green-50"
            textColor="text-green-600"
            borderColor="border-green-200"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            bgColor="bg-red-50"
            textColor="text-red-600"
            borderColor="border-red-200"
          />
          <StatCard
            title="Total Points"
            value={stats.totalPoints}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
            borderColor="border-blue-200"
          />
        </div>

        {/* Filter and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Purchase Requests
              </h2>
              <p className="text-gray-600 text-sm">
                View and manage vendor purchase requests
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["PENDING", "APPROVED", "REJECTED", "ALL"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">
              No {filter === "ALL" ? "requests" : filter.toLowerCase()} requests
              found
            </p>
            <button
              onClick={fetchTransactions}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredTransactions.map((transaction) => (
              <PurchaseTransaction
                key={transaction.request_id}
                request={transaction}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, bgColor, textColor, borderColor }) => {
  return (
    <div className={`${bgColor} border-l-4 ${borderColor} rounded-lg p-6`}>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
    </div>
  );
};

export default Dashboard;
