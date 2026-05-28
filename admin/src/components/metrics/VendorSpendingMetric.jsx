import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../apiInterceptor";
import Loading from "../../Loading";

const VendorSpendingMetric = ({ refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("overall");
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchVendorSpending();
  }, [refreshTrigger, days]);

  const fetchVendorSpending = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/v1/admin/metrics/vendor-spending?days=${days}`,
      );
      setData(data.data);
    } catch (error) {
      toast.error("Failed to fetch vendor spending");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const overall = data?.overall || [];
  const daywise = data?.dayWise || [];

  // Group daywise by date
  const groupedByDate = daywise.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort().reverse();
  const totalOverall = overall.reduce((sum, v) => sum + v.total_points, 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Vendor Spending Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("overall")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === "overall"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setViewMode("daywise")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === "daywise"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Day-wise
          </button>
        </div>
      </div>

      {viewMode === "overall" ? (
        <div>
          {/* Total Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
            <p className="text-gray-600 text-sm">Total Points Issued</p>
            <p className="text-4xl font-bold text-emerald-700 mt-2">
              {totalOverall}
            </p>
          </div>

          {/* Vendors Table */}
          {overall.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No vendor spending data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Rank</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Vendor
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Transactions
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Points
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overall.map((vendor, index) => (
                    <tr
                      key={vendor.vendor_id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-bold text-lg">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {vendor.vendor?.name || "Unknown"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {vendor.vendor?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {vendor.transaction_count}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {vendor.total_points}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="w-24">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{
                                width: `${(vendor.total_points / totalOverall) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {(
                              (vendor.total_points / totalOverall) *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {sortedDates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date} className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">
                    📅 {new Date(date).toLocaleDateString()}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Vendor</th>
                          <th className="px-4 py-2 text-right">Transactions</th>
                          <th className="px-4 py-2 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedByDate[date].map((vendor) => (
                          <tr key={vendor.vendor_id} className="border-t">
                            <td className="px-4 py-2">
                              <div>
                                <p className="font-medium">
                                  {vendor.vendor?.name || "Unknown"}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {vendor.vendor?.email}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right">
                              {vendor.transaction_count}
                            </td>
                            <td className="px-4 py-2 text-right font-bold">
                              {vendor.total_points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorSpendingMetric;
