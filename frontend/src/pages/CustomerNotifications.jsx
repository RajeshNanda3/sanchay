import React, { useEffect, useState } from "react";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/users/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to load notifications",
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/v1/users/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.offer_recipient_id === id
            ? { ...item, read: true, read_at: new Date().toISOString() }
            : item,
        ),
      );
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new Event("notifications-updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const claimOffer = async (id) => {
    try {
      await api.post(`/api/v1/users/notifications/${id}/claim`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.offer_recipient_id === id
            ? {
                ...item,
                redeemed: true,
                redeemed_at: new Date().toISOString(),
                read: true,
                read_at: new Date().toISOString(),
              }
            : item,
        ),
      );
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new Event("notifications-updated"));
      }
      toast.success("Offer claimed successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to claim offer");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-sm text-gray-600">
            Offers sent to you by vendors will appear here.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-10 text-center text-gray-600">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-600">
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((item) => (
                <div
                  key={item.offer_recipient_id}
                  className={`rounded-xl border p-4 ${item.read ? "border-gray-200 bg-white" : "border-indigo-200 bg-indigo-50"}`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {item.offer?.title || "Offer"}
                        </h2>
                        {!item.read && (
                          <span className="rounded-full bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {item.offer?.description || "No description provided."}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        From: {item.offer?.vendor?.name || "Vendor"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(item.notified_at).toLocaleString()}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {!item.redeemed ? (
                          <button
                            onClick={() => claimOffer(item.offer_recipient_id)}
                            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Claim offer
                          </button>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                            Claimed
                          </span>
                        )}
                        {!item.read && !item.redeemed && (
                          <button
                            onClick={() => markAsRead(item.offer_recipient_id)}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
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

export default CustomerNotifications;
