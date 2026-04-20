import React, { useEffect, useState } from "react";
import { AppData } from "../context/AppContext";
import api from "../apiInterceptor";
import { toast } from "react-toastify";

const CustomerProfile = () => {
  const { user, setUser } = AppData();
  const [loading, setLoading] = useState(true);

  // Personal Details State
  const [personalData, setPersonalData] = useState({
    name: "",
    mobile: "",
  });
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Profile Details State
  const [profileData, setProfileData] = useState({
    dob: "",
    address_at: "",
    address_po: "",
    address_market: "",
    address_dist: "",
    address_pin: "",
    avatar: null,
    avatarPreview: null,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user) {
          setPersonalData({
            name: user.name || "",
            mobile: user.mobile || "",
          });

          const res = await api.get("/api/v1/users/profile");
          const p = res.data.profile;
          if (p) {
            setProfileData((f) => ({
              ...f,
              dob: p.dob || "",
              address_at: p.address_at || "",
              address_po: p.address_po || "",
              address_market: p.address_market || "",
              address_dist: p.address_dist || "",
              address_pin: p.address_pin || "",
              avatarPreview: p.avatar || null,
            }));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  // Handle personal data change
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalData((f) => ({ ...f, [name]: value }));
  };

  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files && files[0]) {
      const file = files[0];
      setProfileData((f) => ({
        ...f,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      }));
    } else {
      setProfileData((f) => ({ ...f, [name]: value }));
    }
  };

  // Save personal details
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSavingPersonal(true);
    try {
      const { data } = await api.put("/api/v1/users/update-profile", {
        name: personalData.name,
        mobile: personalData.mobile,
      });
      toast.success("Personal details saved");
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save personal details");
    } finally {
      setSavingPersonal(false);
    }
  };

  // Save profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const form = new FormData();
      form.append("dob", profileData.dob);
      form.append("address_at", profileData.address_at);
      form.append("address_po", profileData.address_po);
      form.append("address_market", profileData.address_market);
      form.append("address_dist", profileData.address_dist);
      form.append("address_pin", profileData.address_pin);
      if (profileData.avatar) {
        form.append("avatar", profileData.avatar);
      }

      const res = await api.post("/api/v1/users/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile details saved");
      if (res.data.profile?.avatar) {
        setProfileData((f) => ({
          ...f,
          avatarPreview: res.data.profile.avatar,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile details");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with avatar and stats */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {profileData.avatarPreview ? (
                <img
                  src={profileData.avatarPreview}
                  alt="avatar"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-4xl font-bold text-indigo-600">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Available Points</p>
              <p className="text-2xl font-bold text-indigo-600">
                {user.points}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Account Type</p>
              <p className="text-xl font-semibold text-green-600">
                {user.role}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Referral Code</p>
              <p className="text-lg font-mono text-blue-600">
                {user.refferal_code || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Personal Details
          </h2>
          <form onSubmit={handleSavePersonal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={personalData.name}
                onChange={handlePersonalChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={personalData.mobile}
                onChange={handlePersonalChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={savingPersonal}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {savingPersonal ? "Saving..." : "Save Personal Details"}
            </button>
          </form>
        </div>

        {/* Profile Details Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Profile Details
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth 
              </label>
              <input
                type="date"
                name="dob"
                value={profileData.dob}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <fieldset className="border p-4 rounded">
              <legend className="text-sm font-medium">Address</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm">AT</label>
                  <input
                    name="address_at"
                    value={profileData.address_at}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm">PO</label>
                  <input
                    name="address_po"
                    value={profileData.address_po}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm">Market</label>
                  <input
                    name="address_market"
                    value={profileData.address_market}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm">District</label>
                  <input
                    name="address_dist"
                    value={profileData.address_dist}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm">PIN</label>
                  <input
                    name="address_pin"
                    value={profileData.address_pin}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full border rounded p-2"
                  />
                </div>
              </div>
            </fieldset>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Avatar
              </label>
              <input
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                className="block w-full"
              />
              {profileData.avatarPreview && (
                <img
                  src={profileData.avatarPreview}
                  alt="avatar preview"
                  className="mt-3 h-24 w-24 rounded-full object-cover border-2 border-indigo-300"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {savingProfile ? "Saving..." : "Save Profile Details"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
