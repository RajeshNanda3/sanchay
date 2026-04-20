import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../apiInterceptor";
import { AppData } from "../context/AppContext";

const VendorDetails = () => {
  const { id } = useParams();
  const { user, isAuth } = AppData();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingError, setRatingError] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchVendorDetails();
    fetchVendorRatings();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/v1/vendor/${id}`);
      setVendor(data.vendor);
    } catch (err) {
      setError(err.message || "Failed to fetch vendor details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorRatings = async () => {
    try {
      const { data } = await api.get(`/api/v1/vendor/${id}/ratings`);
      setRatings(data.ratings || []);
      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuth) {
      setRatingError("Please log in to submit a rating.");
      return;
    }
    if (!ratingStars || ratingStars < 1 || ratingStars > 5) {
      setRatingError("Please select a rating from 1 to 5.");
      return;
    }

    try {
      setSubmittingRating(true);
      setRatingError(null);
      await api.post(`/api/v1/vendor/${id}/rate`, {
        stars: ratingStars,
        comment: ratingComment,
      });
      setRatingComment("");
      await fetchVendorRatings();
    } catch (err) {
      setRatingError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to submit rating",
      );
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading vendor details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p>Error: {error}</p>
          <button
            onClick={fetchVendorDetails}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Vendor not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mr-6">
              <span className="text-3xl font-bold text-indigo-600">
                {vendor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {vendor.name}
              </h1>
              <p className="text-gray-600">{vendor.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Email:</span> {vendor.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {vendor.mobile}
                </p>
                <p>
                  <span className="font-medium">Joined:</span>{" "}
                  {new Date(vendor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {vendor.vendorProfile && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Store Information
                </h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Store Name:</span>{" "}
                    {vendor.vendorProfile.store_name}
                  </p>

                  <p>
                    <span className="font-medium">Deals With:</span>{" "}
                    {Array.isArray(vendor.vendorProfile.deals_with)
                      ? vendor.vendorProfile.deals_with.join(", ")
                      : vendor.vendorProfile.deals_with}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {vendor.vendorProfile.category}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>
                  </p>
                  <div className="ml-4 space-y-1 text-sm">
                    <p>{vendor.vendorProfile.address_at}</p>
                    <p>{vendor.vendorProfile.address_po}</p>
                    <p>{vendor.vendorProfile.address_market}</p>
                    <p>
                      {vendor.vendorProfile.address_dist} -{" "}
                      {vendor.vendorProfile.address_pin}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Vendor Rating
                </h2>
                <p className="text-sm text-gray-600">
                  Rate this vendor and leave a comment about your experience.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-gray-900">
                  {averageRating.toFixed(1)} / 5
                </p>
                <p className="text-sm text-gray-500">
                  {totalRatings} review{totalRatings === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              {ratingError && (
                <div className="rounded-md bg-red-100 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {ratingError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Your Rating
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        className={`rounded-full w-10 h-10 flex items-center justify-center border ${
                          ratingStars >= star
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300"
                        } transition`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Comment
                  </label>
                  <textarea
                    name="comment"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Share your experience with this vendor"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submittingRating ? "Submitting..." : "Submit Rating"}
                </button>
                {!isAuth && (
                  <p className="text-sm text-gray-500">
                    Please log in to submit a rating.
                  </p>
                )}
              </div>
            </form>

            <div className="mt-8 space-y-4">
              {ratings.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-gray-500">
                  No reviews yet for this vendor.
                </div>
              ) : (
                ratings.map((rating) => (
                  <div
                    key={rating.rating_id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {rating.customer?.name || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(rating.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                        {rating.stars} / 5
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700">
                      {rating.comment || "No comment provided."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8">
            <button
              className="bg-indigo-500 text-white px-6 py-3 rounded hover:bg-indigo-600 transition"
              onClick={() => window.history.back()}
            >
              Back to Vendors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
