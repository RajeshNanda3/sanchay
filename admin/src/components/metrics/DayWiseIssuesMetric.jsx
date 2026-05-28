import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../apiInterceptor";
import Loading from "../../Loading";

const DayWiseIssuesMetric = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchDayWiseIssues();
  }, [refreshTrigger, days]);

  const fetchDayWiseIssues = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        `/api/v1/admin/metrics/day-wise-issues?days=${days}`,
      );
      setData(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch day-wise issues");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Group by date
  const groupedByDate = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Day-wise Issues</h2>
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
                      <th className="px-4 py-2 text-right">Issues</th>
                      <th className="px-4 py-2 text-right">Total Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByDate[date].map((item) => (
                      <tr key={item.vendor_id} className="border-t">
                        <td className="px-4 py-2">
                          <div>
                            <p className="font-medium">
                              {item.vendor?.name || "Unknown"}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {item.vendor?.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.issues_count}
                        </td>
                        <td className="px-4 py-2 text-right font-bold">
                          {item.total_points}
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
  );
};

export default DayWiseIssuesMetric;
