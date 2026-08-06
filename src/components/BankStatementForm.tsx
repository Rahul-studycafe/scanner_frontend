import React, { useState } from 'react';
import { type BankStatement } from '../shared/bankStatementSchema';

interface BankStatementFormProps {
  initialData: BankStatement;
  onCancel: () => void;
}

export const BankStatementForm: React.FC<BankStatementFormProps> = ({ initialData, onCancel }) => {
  const [formData, setFormData] = useState<BankStatement>(initialData);

  const handleChange = (field: keyof BankStatement, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTransactionChange = (index: number, field: string, value: any) => {
    const newTransactions = [...formData.transactions];
    newTransactions[index] = { ...newTransactions[index], [field]: value };
    setFormData(prev => ({ ...prev, transactions: newTransactions }));
  };

  const renderField = (label: string, field: keyof BankStatement, type: string = 'text') => {
    const value = formData[field] ?? '';
    const isAutoFilled = initialData[field] !== null && initialData[field] !== undefined;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
          {label}
          {isAutoFilled && <span className="ml-2 text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">Auto</span>}
        </label>
        <input
          type={type}
          value={value as string | number}
          onChange={(e) => handleChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className="w-full p-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-200"
        />
      </div>
    );
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md p-8 border border-slate-700/50 rounded-2xl shadow-2xl shadow-emerald-500/10">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-700/50 pb-4">
        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Review Bank Statement</h2>
      </div>

      {/* Account Info */}
      <div className="border border-slate-700/50 p-5 bg-slate-900/30 rounded-xl mb-6">
        <h3 className="font-semibold text-emerald-300 mb-4 flex items-center"><span className="w-1.5 h-4 bg-emerald-500 rounded-full mr-2"></span>Account Information</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderField('Account Holder Name', 'accountHolderName')}
          {renderField('Account Number', 'accountNumber')}
          {renderField('Bank Name', 'bankName')}
          {renderField('Statement Period', 'statementPeriod')}
        </div>
      </div>

      {/* Balances */}
      <div className="border border-slate-700/50 p-5 bg-slate-900/30 rounded-xl mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[30px]"></div>
        <h3 className="font-semibold text-teal-300 mb-4 flex items-center"><span className="w-1.5 h-4 bg-teal-500 rounded-full mr-2"></span>Balance Summary</h3>
        <div className="grid grid-cols-2 gap-6">
          {renderField('Opening Balance', 'openingBalance', 'number')}
          {renderField('Closing Balance', 'closingBalance', 'number')}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
          <span className="w-1.5 h-4 bg-purple-500 rounded-full mr-2"></span>
          Transactions
          <span className="ml-2 text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">{formData.transactions.length} rows</span>
        </h3>
        <div className="overflow-x-auto border border-slate-700/50 rounded-xl">
          <table className="w-full border-collapse text-sm text-left min-w-[700px]">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 font-medium w-12">#</th>
                <th className="p-3 font-medium w-28">Date</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium w-28 text-right">Withdrawal</th>
                <th className="p-3 font-medium w-28 text-right">Deposit</th>
                <th className="p-3 font-medium w-28 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
              {formData.transactions.map((txn, idx) => (
                <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-2.5 text-slate-500 text-xs">{txn.serialNo || idx + 1}</td>
                  <td className="p-1.5">
                    <input
                      className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                      value={txn.date || ''}
                      onChange={(e) => handleTransactionChange(idx, 'date', e.target.value)}
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                      value={txn.description || ''}
                      onChange={(e) => handleTransactionChange(idx, 'description', e.target.value)}
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="number"
                      className={`w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-xs text-right focus:outline-none focus:border-emerald-500 ${(txn.withdrawal ?? 0) > 0 ? 'text-rose-400' : 'text-slate-200'}`}
                      value={txn.withdrawal ?? 0}
                      onChange={(e) => handleTransactionChange(idx, 'withdrawal', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="number"
                      className={`w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-xs text-right focus:outline-none focus:border-emerald-500 ${(txn.deposit ?? 0) > 0 ? 'text-emerald-400' : 'text-slate-200'}`}
                      value={txn.deposit ?? 0}
                      onChange={(e) => handleTransactionChange(idx, 'deposit', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="number"
                      className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 text-xs text-right focus:outline-none focus:border-emerald-500"
                      value={txn.balance ?? 0}
                      onChange={(e) => handleTransactionChange(idx, 'balance', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                </tr>
              ))}
              {formData.transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No transactions extracted.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4 border-t border-slate-700/50 pt-6">
        <button onClick={onCancel} className="px-6 py-2.5 rounded-lg font-medium border border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">
          Clear
        </button>
      </div>
    </div>
  );
};
