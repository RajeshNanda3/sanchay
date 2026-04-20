import React, { useEffect, useState } from "react";
import api from "../apiInterceptor";
import { AppData } from "../context/AppContext";

const VendorOffers = () => {
  const { user } = AppData();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    active: true,
  });
  const [editOfferId, setEditOfferId] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/api/v1/vendor/offers");
      setOffers(data.offers || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Offer title is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editOfferId) {
        await api.put(`/api/v1/vendor/offers/${editOfferId}`, {
          ...formData,
        });
      } else {
        await api.post("/api/v1/vendor/offers", {
          ...formData,
        });
      }

      setFormData({ title: "", description: "", active: true });
      setEditOfferId(null);
      await fetchOffers();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Unable to save offer");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (offer) => {
    setEditOfferId(offer.offer_id);
    setFormData({
      title: offer.title,
      description: offer.description || "",
      active: offer.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditOfferId(null);
    setError(null);
    setFormData({ title: "", description: "", active: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editOfferId ? "Edit Offer" : "Create New Offer"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {editOfferId
                  ? "Update the selected offer and save your changes."
                  : "Publish a new vendor offer for customers to see."}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              Vendor: <span className="font-semibold">{user?.name}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Offer Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="e.g. 20% off on wellness products"
                  required
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-4">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active offer
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Details about the offer, terms, and expiration (optional)."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : editOfferId ? "Update Offer" : "Create Offer"}
              </button>
              {editOfferId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Offers</h2>
              <p className="text-sm text-gray-500">
                Manage and edit offers created for customers.
              </p>
            </div>
            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              {offers.length} offer{offers.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-gray-600">
              Loading offers...
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-600">
              No offers yet. Create one using the form above.
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div
                  key={offer.offer_id}
                  className="rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {offer.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {offer.description || "No description provided."}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 text-sm text-gray-600 md:items-end">
                      <span className={`inline-flex rounded-full px-3 py-1 font-semibold ${offer.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                        {offer.active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Updated: {new Date(offer.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOffers;
