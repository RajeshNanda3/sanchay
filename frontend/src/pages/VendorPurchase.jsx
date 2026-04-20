import React, { useEffect, useState } from "react";
import { AppData } from "../context/AppContext";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const VendorPurchase = () => {
  const { user, setUser } = AppData();
  const [requests, setRequests] = useState([]);
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    try {
      setFetching(true);
      const { data } = await api.get("/api/v1/vendor/purchase-requests");
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchase requests");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pts = parseInt(points, 10);
    if (!pts || pts <= 0) return toast.error("Enter a valid points amount");

    try {
      setLoading(true);
      const payload = { points: pts };
      const res = await api.post(
        "/api/v1/vendor/create-purchase-request",
        payload,
      );
      toast.success(
        res.data.message || "Purchase request created successfully",
      );

      // refresh vendor points and requests
      try {
        const userRes = await api.get("/api/v1/users/me");
        setUser(userRes.data.user);
      } catch (e) {
        console.warn("Failed to refresh user", e);
      }

      // refresh purchase requests
      await fetchPurchaseRequests();
      setPoints("");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "APPROVED":
        return "✅";
      case "REJECTED":
        return "❌";
      default:
        return "📋";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Purchase Points
        </h1>
        <p className="text-gray-600 mb-8">
          Request to purchase points and track your requests
        </p>

        {/* Main Grid - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Purchase Request Form */}
          <div className="flex flex-col">
            {/* Current Points Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <p className="text-sm text-gray-600">Your Current Points</p>
              <p className="text-4xl font-bold text-indigo-600">
                {user?.points ?? 0}
              </p>
            </div>

            {/* Purchase Form */}
            <div className="bg-white rounded-lg shadow p-6 flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Create Purchase Request
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points to Purchase
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter number of points"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Admin will review and approve/reject your request
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 Pricing Information</p>
                  <p>
                    Contact admin for current point pricing and bulk purchase
                    offers.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 font-medium"
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPoints("")}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Request Status */}
          <div className="flex flex-col">
            <div className="bg-white rounded-lg shadow p-6 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Request History
                </h2>
                <button
                  onClick={fetchPurchaseRequests}
                  className="text-sm bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition"
                >
                  🔄 Refresh
                </button>
              </div>

              {fetching ? (
                <div className="flex justify-center items-center h-96">
                  <p className="text-gray-600">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No purchase requests yet</p>
                  <p className="text-sm">
                    Create your first request to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {requests.map((req) => (
                    <div
                      key={req.request_id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                              {getStatusIcon(req.status)}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(req.status)}`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-800">
                            {req.points}
                          </p>
                          <p className="text-sm text-gray-500">
                            Points Requested
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Request Date:</span>
                          <span className="font-medium text-gray-800">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {req.approved_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Approved Date:
                            </span>
                            <span className="font-medium text-green-600">
                              {new Date(req.approved_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {req.status === "PENDING" && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                          ⏳ Waiting for admin approval
                        </div>
                      )}
                      {req.status === "APPROVED" && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-green-600">
                          ✅ Your request has been approved. Points will be
                          added to your account.
                        </div>
                      )}
                      {req.status === "REJECTED" && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-red-600">
                          ❌ Your request was rejected. Please try again or
                          contact support.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-3">
            How Purchase Requests Work
          </h3>
          <ul className="text-indigo-800 space-y-2">
            <li>
              ✓ Submit a purchase request specifying the number of points you
              need
            </li>
            <li>✓ Admin reviews your request and approves or rejects it</li>
            <li>✓ Upon approval, points are instantly added to your account</li>
            <li>
              ✓ Track all your requests and their status in the history section
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VendorPurchase;
