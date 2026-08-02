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
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(
    "Finding your location...",
  );
  const [selectedFilter, setSelectedFilter] = useState("pincode");
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeFilterValue, setActiveFilterValue] = useState("");

  useEffect(() => {
    const loadVendors = async () => {
      if (!navigator.geolocation) {
        setLocationStatus("Location access is unavailable on this device");
        await fetchVendors();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationStatus("Showing vendors within 2 km of your location");
          try {
            await api.post("/api/v1/users/location", location);
          } catch (err) {
            console.error("Failed to save user location", err);
          }
          await fetchVendors(location);
        },
        async () => {
          setLocationStatus("Location permission denied; showing all vendors");
          await fetchVendors();
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    };

    loadVendors();
  }, []);

  const fetchVendors = async (
    location = null,
    searchFilters = {},
    useLocationScope = false,
  ) => {
    try {
      setLoading(true);
      const normalizedFilters = Object.fromEntries(
        Object.entries(searchFilters || {}).filter(([, value]) => {
          if (value === null || value === undefined) return false;
          return value.toString().trim() !== "";
        }),
      );
      const params = {
        ...normalizedFilters,
      };

      if (useLocationScope && location) {
        params.latitude = location.latitude;
        params.longitude = location.longitude;
        params.radiusKm = 2;
      }

      const { data } = await api.get("/api/v1/users/vendors", { params });
      setVendors(data.vendors || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSelection = (event) => {
    setSelectedFilter(event.target.value);
    setSearchValue("");
  };

  const handleSearchValueChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleApplyFilters = async (event) => {
    event.preventDefault();
    const filterPayload = {
      [selectedFilter]: searchValue,
    };
    setActiveFilter(selectedFilter);
    setActiveFilterValue(searchValue);
    await fetchVendors(
      userLocation,
      filterPayload,
      Boolean(searchValue.trim()),
    );
  };

  const handleClearFilters = async () => {
    setSearchValue("");
    setActiveFilter(null);
    setActiveFilterValue("");
    await fetchVendors(null, {}, false);
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

  const filterFields = [
    { label: "Pincode", name: "pincode", placeholder: "e.g. 700001" },
    {
      label: "Market Name",
      name: "marketName",
      placeholder: "e.g. New Market",
    },
    { label: "District", name: "district", placeholder: "e.g. Kolkata" },
    { label: "State", name: "state", placeholder: "e.g. West Bengal" },
    { label: "Block", name: "block", placeholder: "e.g. Block A" },
    { label: "Vendor Name", name: "vendorName", placeholder: "e.g. Sanchay" },
  ];

  const hasActiveFilters = Boolean(
    activeFilterValue && activeFilterValue.toString().trim(),
  );

  const openDirections = (vendor) => {
    const destLat = vendor.vendorProfile?.latitude;
    const destLng = vendor.vendorProfile?.longitude;

    if (userLocation && destLat && destLng) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destLat},${destLng}&travelmode=driving`;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    if (destLat && destLng) {
      const searchUrl = `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
      window.open(searchUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const query = encodeURIComponent(
      vendor.vendorProfile?.address_market ||
        vendor.vendorProfile?.address_at ||
        vendor.vendorProfile?.store_name ||
        vendor.name,
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="customer-hero p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Nearby Vendors
            </h1>
            <p className="text-gray-600">
              Discover vendors close to you and open directions to reach them
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <p className="font-semibold">{locationStatus}</p>
            {userLocation && (
              <p className="text-xs text-emerald-600 mt-1">
                Using your current location for route directions
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleApplyFilters}
          className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr_auto_auto] md:items-end">
            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">Search by</span>
              <select
                value={selectedFilter}
                onChange={handleFilterSelection}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {filterFields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              <span className="mb-1 block font-medium">Search value</span>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchValueChange}
                placeholder={
                  filterFields.find((field) => field.name === selectedFilter)
                    ?.placeholder
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          {hasActiveFilters && (
            <p className="mt-3 text-sm text-gray-500">
              Showing vendors within 2 km of your current location matching{" "}
              {filterFields
                .find((field) => field.name === activeFilter)
                ?.label?.toLowerCase()}{" "}
              “{activeFilterValue}”.
            </p>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading vendors...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
            <button
              onClick={() =>
                fetchVendors(
                  userLocation,
                  hasActiveFilters ? { [activeFilter]: activeFilterValue } : {},
                  hasActiveFilters,
                )
              }
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
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {vendor.vendorProfile?.banner && (
                  <div className="w-full h-28 overflow-hidden">
                    <img
                      src={vendor.vendorProfile.banner}
                      alt={vendor.vendorProfile?.store_name || vendor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
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
                  <div className="mx-auto mb-4">
                    {vendor.vendorProfile?.avatar ? (
                      <img
                        src={vendor.vendorProfile.avatar}
                        alt={vendor.vendorProfile?.store_name || vendor.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-indigo-200"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mx-auto">
                        <span className="text-2xl font-bold text-indigo-600">
                          {vendor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                    {vendor.vendorProfile?.store_name || "N/A"}
                    <span> </span>
                    <span className="truncate">
                      {vendor.vendorProfile?.address_market}
                    </span>
                  </h3>
                  <div className="mb-3 flex items-center justify-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                      ★ {vendor.average_rating?.toFixed(1) ?? "0.0"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {vendor.rating_count ?? 0} review
                      {vendor.rating_count === 1 ? "" : "s"}
                    </span>
                    {vendor.distance_km !== null &&
                      vendor.distance_km !== undefined && (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {vendor.distance_km.toFixed(1)} km away
                        </span>
                      )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      <span className="truncate">{vendor.email}</span>
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {vendor.mobile}
                    </p>
                    <p>
                      <span className="font-medium">Store Owner:</span>{" "}
                      <span className="text-indigo-600 font-bold">
                        {vendor.name || "N/A"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(vendor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 transition"
                      onClick={() => navigate(`/vendor-details/${vendor.id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="w-full border border-emerald-500 text-emerald-700 py-2 rounded hover:bg-emerald-50 transition"
                      onClick={() => openDirections(vendor)}
                    >
                      Open directions
                    </button>
                  </div>
                </div>
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
