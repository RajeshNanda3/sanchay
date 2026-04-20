import React, { useEffect, useState } from "react";
import { AppData } from "../context/AppContext";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const RedeemPoint = () => {
  const { user, setUser } = AppData();
  const [vendors, setVendors] = useState([]);
  const [vendorIdentifier, setVendorIdentifier] = useState(""); // mobile or id
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [vendorError, setVendorError] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setFetching(true);
      const { data } = await api.get("/api/v1/users/vendors");
      setVendors(data.vendors || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendors");
    } finally {
      setFetching(false);
    }
  };
  const resolveVendor = () => {
    setVendorError("");
    if (!vendorIdentifier) {
      setVendorError("Enter vendor mobile or id");
      setSelectedVendor(null);
      return;
    }
    const found = vendors.find(
      (v) => v.mobile === vendorIdentifier || v.id === vendorIdentifier,
    );
    if (!found) {
      setVendorError("Vendor not found");
      setSelectedVendor(null);
    } else {
      setSelectedVendor(found);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVendor) return toast.error("Please lookup a valid vendor");
    const pts = parseInt(points, 10);
    if (!pts || pts <= 0) return toast.error("Enter a valid points amount");
    if (!user) return toast.error("User not loaded");
    if (pts > user.points) return toast.error("Insufficient points");

    try {
      setLoading(true);
      const payload = { vendorId: selectedVendor.id, points: pts };
      const res = await api.post("/api/v1/redeem", payload);
      toast.success(res.data.message || "Redemption successful");

      // refresh user profile to update points
      try {
        const { data } = await api.get("/api/v1/users/me");
        setUser(data.user);
      } catch (e) {
        console.warn("Failed to refresh user after redeem", e);
      }

      setPoints("");
      setSelectedVendor(null);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Redemption failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Redeem Points</h1>
        <p className="text-gray-600 mb-6">
          Transfer your points to a vendor for purchases.
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-sm text-gray-600">Available Points</p>
          <p className="text-3xl font-bold text-indigo-600">
            {user?.points ?? 0}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor ID or Mobile
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={vendorIdentifier}
                onChange={(e) => {
                  setVendorIdentifier(e.target.value);
                  setSelectedVendor(null);
                  setVendorError("");
                }}
                placeholder="Enter vendor id or mobile"
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={resolveVendor}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Lookup
              </button>
            </div>
            {vendorError && (
              <p className="text-red-500 text-sm mt-1">{vendorError}</p>
            )}
            {selectedVendor && (
              <p className="text-green-600 text-sm mt-1">
                Found: {selectedVendor.name} ({selectedVendor.mobile})
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points to Transfer
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

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || !selectedVendor}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Processing..." : "Redeem Points"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPoints("");
                setSelectedVendor(null);
                setVendorIdentifier("");
                setVendorError("");
              }}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {vendors.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Vendors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((v) => (
                <div key={v.id} className="bg-white p-4 rounded shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{v.name}</h3>
                    <span className="text-sm text-gray-500">{v.mobile}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Email: {v.email}</p>
                  <p className="text-sm text-gray-700 font-semibold">
                    Points: {v.points}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemPoint;
