import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-indigo-500/20 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg shadow-indigo-500/10">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
            Nexus Extract
          </h1>
        </Link>

        {/* Nav Links */}
        <div className="hidden sm:flex items-center space-x-1">
          <Link
            to="/invoice-scanner"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/invoice-scanner')
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Invoice
          </Link>
          <Link
            to="/bank-statement-scanner"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/bank-statement-scanner')
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Bank Statement
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-3 bg-slate-800/50 rounded-full px-4 py-1.5 border border-slate-700/50">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-slate-300">System Online</span>
      </div>
    </nav>
  );
};
