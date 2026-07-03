import React, { useEffect, useState } from "react";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const VendorOfferClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/vendor/offer-claims");
      setClaims(data.claims || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/api/v1/vendor/offer-claims/${id}/read`);
      setClaims((prev) =>
        prev.map((item) =>
          item.offer_recipient_id === id
            ? {
                ...item,
                vendor_read: true,
                vendor_read_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      toast.success("Claim marked read");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to mark claim read");
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Offer Claims</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track customer claims from offer notifications and mark them as
            reviewed.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-10 text-center text-gray-600">
              Loading claims...
            </div>
          ) : claims.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-600">
              No claimed offers yet.
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((item) => (
                <div
                  key={item.offer_recipient_id}
                  className={`rounded-xl border p-4 ${item.vendor_read ? "border-gray-200 bg-white" : "border-emerald-200 bg-emerald-50"}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-lg font-semibold text-gray-900">
                          {item.offer?.title || "Offer"}
                        </div>
                        {!item.vendor_read && (
                          <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                            New claim
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Customer:{" "}
                        {item.customer?.name ||
                          item.customer?.mobile ||
                          "Unknown"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Mobile: {item.customer?.mobile || "N/A"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Claimed at:{" "}
                        {item.redeemed_at
                          ? new Date(item.redeemed_at).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-3 text-sm text-gray-600 lg:items-end">
                      <div className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm">
                        Notification: {item.read ? "Read" : "Unread"}
                      </div>
                      <div className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm">
                        Claimed: {item.redeemed ? "Yes" : "No"}
                      </div>
                      {!item.vendor_read && (
                        <button
                          onClick={() => markRead(item.offer_recipient_id)}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Mark reviewed
                        </button>
                      )}
                    </div>
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

export default VendorOfferClaims;
