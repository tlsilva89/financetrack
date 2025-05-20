import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  FiHome,
  FiActivity,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiBarChart2,
} from "react-icons/fi";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detectar scroll para mudar a aparência da navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-neon-purple/30 ${
        scrolled ? "bg-dark-bg/95 backdrop-blur-md shadow-lg" : "bg-dark-bg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <FiActivity className="h-8 w-8 text-neon-purple" />
              <span className="ml-2 text-xl font-bold text-white">
                FinanceTrack
              </span>
            </Link>
          </div>

          {/* Menu para desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {currentUser && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                      isActive("/dashboard")
                        ? "bg-neon-purple/20 text-neon-purple"
                        : "text-gray-300 hover:bg-dark-surface hover:text-white"
                    }`}
                  >
                    <FiHome className="mr-1.5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/monthly-consumption"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                      isActive("/monthly-consumption")
                        ? "bg-neon-purple/20 text-neon-purple"
                        : "text-gray-300 hover:bg-dark-surface hover:text-white"
                    }`}
                  >
                    <FiBarChart2 className="mr-1.5" />
                    Consumo Mensal
                  </Link>
                  <div className="pl-4 border-l border-gray-700">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                        <FiUser />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-300">
                        {currentUser.email?.split("@")[0]}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="ml-4 text-gray-400 hover:text-white transition-colors"
                        title="Sair"
                      >
                        <FiLogOut />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!currentUser && (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-md hover:bg-neon-purple/30 transition-colors flex items-center"
                >
                  <FiUser className="mr-1.5" />
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Botão de menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-dark-bg border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentUser && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-base font-medium w-full inline-flex items-center ${
                    isActive("/dashboard")
                      ? "bg-neon-purple/20 text-neon-purple"
                      : "text-gray-300 hover:bg-dark-surface hover:text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <FiHome className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/monthly-consumption"
                  className={`px-3 py-2 rounded-md text-base font-medium w-full inline-flex items-center ${
                    isActive("/monthly-consumption")
                      ? "bg-neon-purple/20 text-neon-purple"
                      : "text-gray-300 hover:bg-dark-surface hover:text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <FiBarChart2 className="mr-2" />
                  Consumo Mensal
                </Link>
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-3">
                    <div className="h-8 w-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                      <FiUser />
                    </div>
                    <span className="ml-3 text-base font-medium text-gray-300">
                      {currentUser.email?.split("@")[0]}
                    </span>
                  </div>
                  <div className="mt-3 px-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-dark-surface inline-flex items-center"
                    >
                      <FiLogOut className="mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}

            {!currentUser && (
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-dark-surface hover:text-white inline-flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <FiUser className="mr-2" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
