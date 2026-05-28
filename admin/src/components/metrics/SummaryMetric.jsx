import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../apiInterceptor";
import Loading from "../../Loading";

const SummaryMetric = ({ refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [refreshTrigger]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/admin/metrics/summary");
      setData(data.data);
    } catch (error) {
      toast.error("Failed to fetch summary metrics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const stats = [
    {
      label: "Total Users",
      value: data?.totalUsers || 0,
      icon: "👤",
      color: "indigo",
    },
    {
      label: "Total Vendors",
      value: data?.totalVendors || 0,
      icon: "🏪",
      color: "emerald",
    },
    {
      label: "Total Admins",
      value: data?.totalAdmins || 0,
      icon: "🔑",
      color: "red",
    },
    {
      label: "Points Issued",
      value: data?.totalPointsIssued || 0,
      icon: "➕",
      color: "blue",
    },
    {
      label: "Points Redeemed",
      value: data?.totalPointsRedeemed || 0,
      icon: "✅",
      color: "green",
    },
  ];

  const colorMap = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${colorMap[stat.color]} border rounded-lg p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className="text-3xl opacity-50">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryMetric;
