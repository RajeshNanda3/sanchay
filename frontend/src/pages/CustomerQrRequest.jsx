import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const CustomerQrRequest = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [qrInput, setQrInput] = useState("");
  const [scannedValue, setScannedValue] = useState("");
  const [requestResult, setRequestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const videoElement = videoRef.current;
      if (!videoElement) {
        throw new Error("Video element not ready");
      }

      const scanner = new QrScanner(
        videoElement,
        (result) => {
          setScannedValue(result.data);
          setQrInput(result.data);
          stopScanning();
          toast.success("QR code scanned successfully.");
        },
        {
          onDecodeError: (error) => {
            console.error(error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );
      scannerRef.current = scanner;
      await scanner.start();
    } catch (error) {
      console.error(error);
      toast.error("Unable to start scanner.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    const value = qrInput.trim();
    if (!value) {
      return toast.error("Please scan or enter a QR value first.");
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/v1/qr-requests", {
        qrValue: value,
      });
      setRequestResult(data.request);
      toast.success(data.message || "Request created successfully.");
    } catch (error) {
      console.error(error);
      setRequestResult(null);
      toast.error(error.response?.data?.error || "Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scan Vendor QR</h1>
          <p className="mt-2 text-gray-600">
            Scan the vendor QR code to request the points amount attached to it.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR value or code
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Paste vendorqr:<qr_id> or scanned value"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={isScanning ? stopScanning : startScanning}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {isScanning ? "Stop scanning" : "Scan QR"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {loading ? "Sending request..." : "Send request"}
                </button>
              </div>

              {scannedValue && (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                  Scanned value:{" "}
                  <span className="font-semibold">{scannedValue}</span>
                </div>
              )}

              {isScanning && (
                <div className="mt-4">
                  <video
                    ref={videoRef}
                    className="w-full rounded-2xl border border-gray-300"
                  ></video>
                </div>
              )}
            </form>

            <div className="rounded-3xl bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Request details
              </h2>
              <p className="text-gray-600 mb-4">
                When you scan a valid vendor QR code, the request will be
                created as pending. The vendor will approve or reject the
                request.
              </p>
              {requestResult ? (
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Request ID</p>
                  <p className="font-semibold text-slate-900 mb-3">
                    {requestResult.request_id}
                  </p>
                  <p className="text-sm text-slate-500">Requested points</p>
                  <p className="font-semibold text-slate-900 mb-3">
                    {requestResult.points}
                  </p>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-semibold text-slate-900">
                    {requestResult.status}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  Pending request details will appear here after submission.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerQrRequest;
