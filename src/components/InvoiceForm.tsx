import React, { useState } from 'react';
import { type GSTInvoice } from '../shared/schema';

interface InvoiceFormProps {
  initialData: GSTInvoice;
  onSave: (data: GSTInvoice) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<GSTInvoice>(initialData);

  const handleChange = (field: keyof GSTInvoice, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', hsnSac: '', goodsQuantity: '', goodsRate: 0, amount: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const renderField = (label: string, field: keyof GSTInvoice, type: string = 'text') => {
    const value = formData[field] ?? '';
    const isAutoFilled = initialData[field] !== null && initialData[field] !== undefined;
    const isMissing = !isAutoFilled && !value;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
          {label}
          {isAutoFilled && <span className="ml-2 text-[10px] uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">Auto</span>}
          {isMissing && <span className="ml-2 text-[10px] uppercase tracking-wider bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 animate-pulse">Required</span>}
        </label>
        <input
          type={type}
          value={value as string | number}
          onChange={(e) => handleChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className={`w-full p-2.5 rounded-lg bg-slate-900/50 border transition-all duration-200 text-slate-200 placeholder-slate-500 ${isMissing ? 'border-rose-500/50 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50' : 'border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50'} focus:outline-none`}
        />
      </div>
    );
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md p-8 border border-slate-700/50 rounded-2xl shadow-2xl shadow-indigo-500/10">
      <div className="flex items-center space-x-3 mb-6 border-b border-slate-700/50 pb-4">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Review Invoice Details</h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {renderField('Invoice Number', 'invoiceNumber')}
        {renderField('Invoice Date', 'invoiceDate', 'date')}
      </div>

      <div className="mt-6">
        <div className="border border-slate-700/50 p-5 bg-slate-900/30 rounded-xl">
          <h3 className="font-semibold text-indigo-300 mb-4 flex items-center"><span className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2"></span>Seller Details</h3>
          <div className="grid grid-cols-2 gap-6">
            {renderField('Seller Name', 'sellerName')}
            {renderField('Seller GSTIN', 'sellerGSTIN')}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="border border-slate-700/50 p-5 bg-slate-900/30 rounded-xl">
          <h3 className="font-semibold text-sky-300 mb-4 flex items-center"><span className="w-1.5 h-4 bg-sky-500 rounded-full mr-2"></span>Buyer Details</h3>
          <div className="grid grid-cols-2 gap-6">
            {renderField('Buyer Name', 'buyerName')}
            {renderField('Buyer GSTIN', 'buyerGSTIN')}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center"><span className="w-1.5 h-4 bg-purple-500 rounded-full mr-2"></span>Line Items</h3>
        <div className="overflow-hidden border border-slate-700/50 rounded-xl">
          <table className="w-full border-collapse text-sm text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 w-24 font-medium">HSN/SAC</th>
                <th className="p-3 w-24 font-medium">Qty</th>
                <th className="p-3 w-28 font-medium">Rate</th>
                <th className="p-3 w-28 font-medium">Amount</th>
                <th className="p-3 w-16 text-center font-medium">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
              {formData.lineItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                  <td className="p-1.5"><input className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500" value={item.description || ''} onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)} /></td>
                  <td className="p-1.5"><input className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500" value={item.hsnSac || ''} onChange={(e) => handleLineItemChange(idx, 'hsnSac', e.target.value)} /></td>
                  <td className="p-1.5"><input className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500" value={(item as any).goodsQuantity || ''} onChange={(e) => handleLineItemChange(idx, 'goodsQuantity', e.target.value)} /></td>
                  <td className="p-1.5"><input type="number" className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500" value={(item as any).goodsRate || 0} onChange={(e) => handleLineItemChange(idx, 'goodsRate', parseFloat(e.target.value) || 0)} /></td>
                  <td className="p-1.5"><input type="number" className="w-full p-2 bg-slate-900/50 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-indigo-500" value={(item as any).amount || 0} onChange={(e) => handleLineItemChange(idx, 'amount', parseFloat(e.target.value) || 0)} /></td>
                  <td className="p-1.5 text-center">
                    <button onClick={() => removeLineItem(idx)} className="text-rose-400 p-2 hover:bg-rose-500/20 rounded transition-colors" title="Remove Item">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addLineItem} className="mt-3 text-sm font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 mt-8">
        <div className="border border-slate-700/50 p-5 bg-slate-900/30 rounded-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-[30px]"></div>
          <h3 className="font-semibold text-indigo-300 mb-4 flex items-center">Tax Calculation</h3>
          <div className="grid grid-cols-2 gap-6">
            {renderField('Taxable Value', 'taxableValue', 'number')}
            {renderField('CGST Amount', 'cgstAmount', 'number')}
            {renderField('SGST Amount', 'sgstAmount', 'number')}
            {renderField('IGST Amount', 'igstAmount', 'number')}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            {renderField('Total Invoice Amount', 'totalInvoiceAmount', 'number')}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4 border-t border-slate-700/50 pt-6">
        <button onClick={onCancel} className="px-6 py-2.5 rounded-lg font-medium border border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">
          Cancel
        </button>
        <button onClick={() => onSave(formData)} className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 transform transition hover:-translate-y-0.5">
          Save Invoice
        </button>
      </div>
    </div>
  );
};
