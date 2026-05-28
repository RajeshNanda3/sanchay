import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../apiInterceptor";
import Loading from "../Loading";
import SummaryMetric from "../components/metrics/SummaryMetric";
import DayWiseIssuesMetric from "../components/metrics/DayWiseIssuesMetric";
import ReferrerJoinsMetric from "../components/metrics/ReferrerJoinsMetric";
import VendorSpendingMetric from "../components/metrics/VendorSpendingMetric";

const AdminMetrics = () => {
  const [activeTab, setActiveTab] = useState("summary");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Data refreshed");
  };

  const tabs = [
    { id: "summary", label: "Summary", icon: "📊" },
    { id: "day-issues", label: "Day-wise Issues", icon: "📈" },
    { id: "referrers", label: "Referrer Joins", icon: "👥" },
    { id: "vendor-spend", label: "Vendor Spending", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Professional data analytics and insights
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              🔄 Refresh All
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "summary" && (
            <SummaryMetric refreshTrigger={refreshTrigger} />
          )}
          {activeTab === "day-issues" && (
            <DayWiseIssuesMetric refreshTrigger={refreshTrigger} />
          )}
          {activeTab === "referrers" && (
            <ReferrerJoinsMetric refreshTrigger={refreshTrigger} />
          )}
          {activeTab === "vendor-spend" && (
            <VendorSpendingMetric refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
