import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppData } from "../context/AppContext";
import CustomerNav from "../components/CustomerNav";
import api from "../apiInterceptor";

const CustomerHero = () => {
  const { user, isAuth } = AppData();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorOffers, setVendorOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/users/vendors");
      setVendors(data.vendors || []);
      // console.log(vendor.vendorProfile.store_name)
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorOffers = async (vendor) => {
    try {
      setOffersLoading(true);
      const { data } = await api.get(`/api/v1/vendor/${vendor.id}/offers`);
      setVendorOffers(data.offers || []);
      setSelectedVendor(vendor);
      setShowOffersModal(true);
    } catch (err) {
      console.error("Failed to fetch vendor offers:", err);
      setError("Failed to load offers");
    } finally {
      setOffersLoading(false);
    }
  };

  const closeOffersModal = () => {
    setShowOffersModal(false);
    setSelectedVendor(null);
    setVendorOffers([]);
  };

  return (
    <div className="customer-hero p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Our Vendors</h1>
        <p className="text-gray-600 mb-8">
          Explore all our trusted vendors and their offerings
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading vendors...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
            <button
              onClick={fetchVendors}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : vendors.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>No vendors available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="absolute top-4 right-4">
                  {vendor.offer_count > 0 ? (
                    <button
                      onClick={() => fetchVendorOffers(vendor)}
                      className="bg-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold hover:bg-indigo-600 transition-colors cursor-pointer"
                      title="View offers"
                    >
                      {vendor.offer_count}
                    </button>
                  ) : (
                    <div className="bg-gray-400 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-semibold">
                      0
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">
                    {vendor.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                  {vendor.name}
                </h3>
                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                    ★ {vendor.average_rating?.toFixed(1) ?? "0.0"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {vendor.rating_count ?? 0} review
                    {vendor.rating_count === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    <span className="truncate">{vendor.email}</span>
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {vendor.mobile}
                  </p>
                  <p>
                    <span className="font-medium">Store Name:</span>{" "}
                    <span className="text-indigo-600 font-bold">
                      {vendor.vendorProfile?.store_name || "N/A"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(vendor.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="w-full mt-4 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition"
                  onClick={() => navigate(`/vendor-details/${vendor.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offers Modal */}
      {showOffersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Offers by{" "}
                {selectedVendor?.vendorProfile?.store_name ||
                  selectedVendor?.name}
              </h2>
              <button
                onClick={closeOffersModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {offersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-600">Loading offers...</div>
                </div>
              ) : vendorOffers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No active offers available</p>
                  <p className="text-sm">
                    Check back later for new offers from this vendor.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendorOffers.map((offer) => (
                    <div
                      key={offer.offer_id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {offer.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {offer.description || "No description provided."}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Updated:{" "}
                          {new Date(offer.updated_at).toLocaleDateString()}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={closeOffersModal}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHero;
