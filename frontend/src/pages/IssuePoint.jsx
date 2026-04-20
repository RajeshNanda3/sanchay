import React, { useEffect, useState } from "react";
import { AppData } from "../context/AppContext";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const IssuePoint = () => {
  const { user, setUser } = AppData();
  const [customers, setCustomers] = useState([]);
  const [customerIdentifier, setCustomerIdentifier] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [points, setPoints] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [customerError, setCustomerError] = useState("");
  const [issueHistory, setIssueHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setFetching(true);
      const { data } = await api.get("/api/v1/users/customers");
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customers");
    } finally {
      setFetching(false);
    }
  };

  const fetchCustomerIssueHistory = async (customerId) => {
    try {
      setFetchingHistory(true);
      const { data } = await api.get(
        `/api/v1/customer-issue-history/${customerId}`,
      );
      setIssueHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setIssueHistory([]);
      toast.error("Failed to load customer history");
    } finally {
      setFetchingHistory(false);
    }
  };

  const resolveCustomer = () => {
    setCustomerError("");
    if (!customerIdentifier) {
      setCustomerError("Enter customer mobile or id");
      setSelectedCustomer(null);
      setIssueHistory([]);
      return;
    }
    const found = customers.find(
      (c) => c.mobile === customerIdentifier || c.id === customerIdentifier,
    );
    if (!found) {
      setCustomerError("Customer not found");
      setSelectedCustomer(null);
      setIssueHistory([]);
    } else {
      setSelectedCustomer(found);
      fetchCustomerIssueHistory(found.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return toast.error("Please lookup a valid customer");
    const pts = parseInt(points, 10);
    if (!pts || pts <= 0) return toast.error("Enter a valid points amount");
    const bill = parseFloat(billAmount);
    // if (!bill || bill <= 0) return toast.error("Enter a valid bill amount");
    if (!user) return toast.error("User not loaded");
    if (pts > user.points) return toast.error("Insufficient points");

    try {
      setLoading(true);
      const payload = {
        vendorId: user.id,
        customerId: selectedCustomer.id,
        points: pts,
        billAmount: bill,
      };
      const res = await api.post("/api/v1/issue", payload);
      toast.success(res.data.message || "Points issued successfully");

      // refresh vendor points
      try {
        const { data } = await api.get("/api/v1/users/me");
        setUser(data.user);
      } catch (e) {
        console.warn("Failed to refresh user after issue", e);
      }

      // refresh customer history
      await fetchCustomerIssueHistory(selectedCustomer.id);

      setPoints("");
      setBillAmount("");
      setSelectedCustomer(null);
      setCustomerIdentifier("");
      setCustomerError("");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Issue failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Issue Points</h1>
        <p className="text-gray-600 mb-6">
          Assign points to a customer by ID or phone.
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-sm text-gray-600">Your Available Points</p>
          <p className="text-3xl font-bold text-indigo-600">
            {user?.points ?? 0}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 mb-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer ID or Mobile
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customerIdentifier}
                onChange={(e) => {
                  setCustomerIdentifier(e.target.value);
                  setSelectedCustomer(null);
                  setCustomerError("");
                  setIssueHistory([]);
                }}
                placeholder="Enter customer id or mobile"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={resolveCustomer}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Lookup
              </button>
            </div>
            {customerError && (
              <p className="text-red-500 text-sm mt-1">{customerError}</p>
            )}
            {selectedCustomer && (
              <p className="text-green-600 text-sm mt-1">
                Found: {selectedCustomer.name} ({selectedCustomer.mobile})
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points to Issue
            </label>
            <input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Enter amount of points"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bill Amount
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Enter bill amount"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || !selectedCustomer}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-60"
            >
              {loading ? "Processing..." : "Issue Points"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPoints("");
                setBillAmount("");
                setSelectedCustomer(null);
                setCustomerIdentifier("");
                setCustomerError("");
                setIssueHistory([]);
              }}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Customer Issue History */}
        {selectedCustomer && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Issue History with {selectedCustomer.name}
            </h2>

            {fetchingHistory ? (
              <p className="text-gray-600 text-center py-4">
                Loading history...
              </p>
            ) : issueHistory.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                No issues history with this customer yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Points Issued
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Bill Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {issueHistory.map((issue, index) => (
                      <tr
                        key={issue.issuance_id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(issue.ledger.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          +{issue.points_issued}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {issue.customer.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            ₹{issue.bill_amount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuePoint;
//     </button>
//     <button
//       type="button"
//       onClick={() => {
//         setPoints("");
//         setSelectedCustomer(null);
//         setCustomerIdentifier("");
//         setCustomerError("");
//         setIssueHistory([]);
//       }}
//       className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
//     >
//       Reset
//     </button>
//   </div>
// </form>
