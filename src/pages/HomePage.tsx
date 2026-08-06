import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center px-4 sm:px-6 relative">
      {/* Background effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Hero text */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
          Nexus Extract
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          AI-powered document extraction engine. Choose a module below to get started.
        </p>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-3xl w-full relative z-10">
        {/* Invoice Scanner Card */}
        <Link
          to="/invoice-scanner"
          className="group relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-indigo-500/5 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors">
              Invoice Scanner
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Extract GST invoice data automatically. Supports Tax Invoices, Debit Notes, Credit Notes, and more.
            </p>
            
            <div className="flex items-center text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors">
              <span>Open Scanner</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Bank Statement Scanner Card */}
        <Link
          to="/bank-statement-scanner"
          className="group relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-emerald-500/5 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-emerald-300 transition-colors">
              Bank Statement Scanner
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Extract bank statement transactions. Supports all major Indian banks — SBI, HDFC, ICICI, and more.
            </p>

            <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">
              <span>Open Scanner</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer tagline */}
      <p className="text-slate-600 text-xs mt-12 relative z-10">
        Powered by Local AI — Your data never leaves your machine.
      </p>
    </div>
  );
};
