import React, { useEffect, useState } from "react";
import api from "../apiInterceptor";
import { AppData } from "../context/AppContext";
import { toast } from "react-toastify";

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
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [eligibleCustomers, setEligibleCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [notifying, setNotifying] = useState(false);

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
      setError(
        err?.response?.data?.message || err.message || "Failed to load offers",
      );
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
      setError(
        err?.response?.data?.message || err.message || "Unable to save offer",
      );
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

  const openNotifyPanel = async (offer) => {
    setSelectedOffer(offer);
    setSelectedCustomerIds([]);
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/vendor/eligible-customers");
      setEligibleCustomers(data.customers || []);
      setShowNotifyModal(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomer = (id) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSendNotifications = async () => {
    if (!selectedOffer) return;
    if (selectedCustomerIds.length === 0)
      return toast.error("Select at least one customer");
    try {
      setNotifying(true);
      await api.post(`/api/v1/vendor/offers/${selectedOffer.offer_id}/notify`, {
        recipientIds: selectedCustomerIds,
      });
      toast.success("Notifications sent");
      setShowNotifyModal(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to send notifications",
      );
    } finally {
      setNotifying(false);
    }
  };

  const handleCancel = () => {
    setEditOfferId(null);
    setError(null);
    setFormData({ title: "", description: "", active: true });
  };

  const summary = offers.reduce(
    (acc, offer) => {
      const notified = Number(offer.totalNotified ?? 0);
      const read = Number(offer.readCount ?? 0);
      const claimed = Number(offer.claimedCount ?? 0);

      acc.totalNotified += notified;
      acc.totalRead += read;
      acc.totalClaimed += claimed;
      acc.activeOffers += offer.active ? 1 : 0;
      return acc;
    },
    { totalNotified: 0, totalRead: 0, totalClaimed: 0, activeOffers: 0 },
  );

  const readRate =
    summary.totalNotified > 0
      ? ((summary.totalRead / summary.totalNotified) * 100).toFixed(1)
      : "0.0";

  const claimRate =
    summary.totalNotified > 0
      ? ((summary.totalClaimed / summary.totalNotified) * 100).toFixed(1)
      : "0.0";

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
                <label
                  htmlFor="active"
                  className="text-sm font-medium text-gray-700"
                >
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
                {saving
                  ? "Saving..."
                  : editOfferId
                    ? "Update Offer"
                    : "Create Offer"}
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
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Offers</h2>
              <p className="text-sm text-gray-500">
                Manage and edit offers created for customers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <div className="text-slate-500">Notified</div>
                <div className="font-semibold text-slate-800">
                  {summary.totalNotified}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <div className="text-slate-500">Read rate</div>
                <div className="font-semibold text-slate-800">{readRate}%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <div className="text-slate-500">Claim rate</div>
                <div className="font-semibold text-slate-800">{claimRate}%</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <div className="text-slate-500">Active offers</div>
                <div className="font-semibold text-slate-800">
                  {summary.activeOffers}
                </div>
              </div>
            </div>
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
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          Notified: {offer.totalNotified ?? 0}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          Read: {offer.readCount ?? 0}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          Claimed: {offer.claimedCount ?? 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 text-sm text-gray-600 md:items-end">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-semibold ${offer.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {offer.active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Updated:{" "}
                        {new Date(offer.updated_at).toLocaleDateString()}
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
                    <button
                      onClick={() => openNotifyPanel(offer)}
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      Notify customers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Notify modal */}
        {showNotifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-3xl rounded-lg bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Notify Customers</h3>
                <div className="text-sm text-gray-600">
                  Offer: {selectedOffer?.title}
                </div>
              </div>
              <div className="max-h-72 overflow-auto border rounded p-3 mb-4">
                {eligibleCustomers.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    No eligible customers found.
                  </div>
                ) : (
                  eligibleCustomers.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-slate-50 px-3 py-2 text-sm hover:border-indigo-400"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomerIds.includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                        className="h-4 w-4 shrink-0"
                      />
                      {c.profile_pic ? (
                        <img
                          src={c.profile_pic}
                          alt={c.name || "Customer avatar"}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-700">
                          {c.name ? c.name[0]?.toUpperCase() : "?"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-gray-900">
                              {c.name || c.mobile}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {c.mobile}
                            </div>
                          </div>
                          <div className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                            {c.transaction_count} tx
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                          <div className="rounded-full bg-white px-2 py-1 shadow-sm">
                            First:{" "}
                            {c.first_transaction_date
                              ? new Date(
                                  c.first_transaction_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="rounded-full bg-white px-2 py-1 shadow-sm">
                            Last:{" "}
                            {c.last_transaction_date
                              ? new Date(
                                  c.last_transaction_date,
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="rounded-full bg-white px-2 py-1 shadow-sm">
                            {c.address_at || "No address"}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="rounded-md border px-4 py-2 bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotifications}
                  disabled={notifying}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
                >
                  {notifying ? "Sending..." : "Send Notifications"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOffers;
