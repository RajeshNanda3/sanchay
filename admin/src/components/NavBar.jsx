import React from "react";
import { useNavigate } from "react-router-dom";
import { AppData } from "../context/AppContext";

const NavBar = () => {
  const { user, logoutUser } = AppData();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logoutUser(navigate);
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/transactions")}
              className="hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Transactions
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-3 pt-2 space-y-1">
            <button
              onClick={() => {
                navigate("/dashboard");
                setIsOpen(false);
              }}
              className="block w-full text-left hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate("/transactions");
                setIsOpen(false);
              }}
              className="block w-full text-left hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
            >
              Transactions
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-base font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
