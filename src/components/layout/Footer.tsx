import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiCode, FiActivity } from "react-icons/fi";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-bg border-t border-gray-800 pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <FiActivity className="h-6 w-6 text-neon-purple" />
              <span className="ml-2 text-lg font-bold text-white">
                FinanceTrack
              </span>
            </Link>
            <p className="mt-2 text-sm text-gray-400 max-w-md">
              Gerencie suas finanças pessoais de forma simples e eficiente com
              nosso painel financeiro intuitivo.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-sm text-gray-400">
              <p className="flex items-center justify-end">
                Desenvolvido por{" "}
                <a
                  href="https://digitalspark.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-purple hover:text-neon-purple/80 ml-1 font-medium"
                >
                  Digital Spark
                </a>
                <FiHeart className="h-3 w-3 text-neon-purple ml-1" />
              </p>
              <p className="mt-1 flex items-center justify-end">
                <FiCode className="h-3 w-3 mr-1" /> © {currentYear} Todos os
                direitos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
