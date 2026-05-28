import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../apiInterceptor";
import Loading from "../../Loading";

const ReferrerJoinsMetric = ({ refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrerJoins();
  }, [refreshTrigger]);

  const fetchReferrerJoins = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/v1/admin/metrics/referrer-joins");
      setData(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch referrer joins");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const totalJoins = data.reduce((sum, item) => sum + item.total_joins, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Referrer Performance</h2>

      {data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No referrer data available</p>
        </div>
      ) : (
        <div>
          {/* Top Stat */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
            <p className="text-gray-600 text-sm">Total Joins via Referrals</p>
            <p className="text-4xl font-bold text-indigo-700 mt-2">
              {totalJoins}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Referrer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Joins
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={item.referrer_id}
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
                          {item.referrer?.name || "Unknown"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {item.referrer?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium">
                        {item.referrer?.role || "USER"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      {item.total_joins}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="w-24">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(item.total_joins / totalJoins) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {((item.total_joins / totalJoins) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferrerJoinsMetric;
