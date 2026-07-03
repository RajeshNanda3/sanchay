import { createContext, useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// import axios from "axios";
import { server } from "../main";
import api from "../apiInterceptor";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  async function fetchUser() {
    try {
      console.log("hii rajesh");
      const { data } = await api.get(`api/v1/users/me`);
      console.log(data);
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotificationCount() {
    if (!isAuth) {
      setNotificationCount(0);
      return;
    }
    try {
      const { data } = await api.get("/api/v1/users/notifications");
      const unread = (data.notifications || []).filter(
        (item) => !item.read,
      ).length;
      setNotificationCount(unread);
    } catch (error) {
      console.error("Failed to fetch unread notifications", error);
    }
  }

  async function logoutUser(e) {
    console.log("hii rajesh4");
    try {
      const { data } = await api.post("/api/v1/users/logout");
      toast.success(data.message);
      setIsAuth(false);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.log("got the erreo", error);
      toast.error("Somthing went wrong2");
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        setIsAuth,
        isAuth,
        user,
        setUser,
        loading,
        setLoading,
        logoutUser,
        notificationCount,
        setNotificationCount,
        fetchNotificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const AppData = () => {
  const context = useContext(AppContext);

  if (!context) throw new Error("Appdata must be used within an AppProvider");
  return context;
};
