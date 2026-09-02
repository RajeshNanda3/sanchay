import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../apiInterceptor.js";
import Loading from "../Loading.jsx";

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      const { data } = await api.get("/api/v1/admin/vendors", { params });
      setVendors(data.vendors || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch vendors",
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleToggleStatus = async (vendor) => {
    const newStatus = vendor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const confirmMessage = `Are you sure you want to change ${vendor.vendorProfile?.store_name || vendor.name}'s status to ${newStatus}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setActionLoading(vendor.id);
    try {
      const { data } = await api.post(
        `/api/v1/admin/vendors/${vendor.id}/toggle-status`,
        { status: newStatus },
      );
      toast.success(data.message);
      fetchVendors();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update vendor status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-700",
      INACTIVE: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600 mt-2">
            Manage all registered vendors and their status
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by name, email, or store
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setTimeout(fetchVendors, 0);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Table */}
        {vendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">
              No vendors found
            </p>
            <button
              onClick={fetchVendors}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Vendor</th>
                    <th className="px-4 py-3 text-left font-semibold">Store</th>
                    <th className="px-4 py-3 text-left font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {vendor.vendorProfile?.avatar ? (
                            <img
                              src={vendor.vendorProfile.avatar}
                              alt={vendor.vendorProfile?.store_name || vendor.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {vendor.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{vendor.name}</p>
                            <p className="text-gray-500 text-sm">{vendor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {vendor.vendorProfile?.store_name || "N/A"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {vendor.vendorProfile?.address_market || "N/A"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{vendor.mobile}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">
                          {vendor.vendorProfile?.category || "N/A"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(vendor.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggleStatus(vendor)}
                          disabled={actionLoading === vendor.id}
                          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 ${
                            vendor.status === "ACTIVE"
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {actionLoading === vendor.id
                            ? "Updating..."
                            : vendor.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={fetchVendors}
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

export default AdminVendors;
