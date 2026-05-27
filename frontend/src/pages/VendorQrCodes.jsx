import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const VendorQrCodes = () => {
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQrCodes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/vendor/qr-codes");
      setQrCodes(data.qrCodes || []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load QR codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const parsedPoints = parseInt(points, 10);
    if (!parsedPoints || parsedPoints <= 0) {
      return toast.error("Enter a valid points amount.");
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/v1/vendor/qr-codes", {
        points: parsedPoints,
        title,
      });
      toast.success(data.message || "QR code created.");
      setTitle("");
      setPoints("");
      fetchQrCodes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create QR code.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (qrCode) => {
    try {
      setLoading(true);
      await api.put(`/api/v1/vendor/qr-codes/${qrCode.qr_id}`, {
        active: !qrCode.active,
      });
      fetchQrCodes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to update QR code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vendor QR Codes
            </h1>
            <p className="mt-2 text-gray-600">
              Create fixed-point QR codes that customers can scan to request
              points.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] mb-8">
          <form
            onSubmit={handleCreate}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create new QR code
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                placeholder="E.g. 10 points offer"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                placeholder="Enter points for this QR"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create QR Code"}
            </button>
          </form>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              QR code usage
            </h2>
            <p className="text-gray-600">
              Share the generated QR with customers. When a customer scans it, a
              pending request is created and you can approve it from the
              Requests page.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {qrCodes.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-sm">
              No QR codes created yet.
            </div>
          ) : (
            qrCodes.map((qr) => {
              const qrValue = `vendorqr:${qr.qr_id}`;
              return (
                <div
                  key={qr.qr_id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">QR title</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {qr.title || "Untitled QR"}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Points:{" "}
                        <span className="font-semibold">{qr.points}</span>
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Status: {qr.active ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleActive(qr)}
                        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                      >
                        {qr.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(qrValue)}
                        className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Copy code
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
                    <div className="inline-flex items-center justify-center rounded-xl bg-slate-50 p-4">
                      <QRCode value={qrValue} size={120} />
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-gray-500">Scan value</p>
                      <p className="break-all text-sm font-medium text-slate-900">
                        {qrValue}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorQrCodes;
