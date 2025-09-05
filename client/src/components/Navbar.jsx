import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, Briefcase, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Brand */}
          <div className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-primary-500" />
            <h1 className="text-xl font-bold text-gray-900">JobBoard</h1>
          </div>

          {/* User Info + Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize">
                  {user.role}
                </span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
