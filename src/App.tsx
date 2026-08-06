import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { InvoiceScanner } from './pages/InvoiceScanner';
import { BankStatementScanner } from './pages/BankStatementScanner';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/invoice-scanner" element={<InvoiceScanner />} />
        <Route path="/bank-statement-scanner" element={<BankStatementScanner />} />
      </Routes>
    </div>
  );
}

export default App;
