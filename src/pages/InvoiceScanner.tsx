import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UploadZone } from '../components/UploadZone';
import { BatchProgress } from '../components/BatchProgress';
import { InvoiceForm } from '../components/InvoiceForm';
import {
  extractInvoice, saveInvoice, getAvailableModels,
  submitBatchExtraction, getSocket, joinUserRoom, getUserId,
  type CompanyContext, type BatchJob
} from '../api/client';
import { type GSTInvoice } from '../shared/schema';

export const InvoiceScanner = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<GSTInvoice | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [extractionTime, setExtractionTime] = useState<string | null>(null);

  // Batch mode state
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [batchStats, setBatchStats] = useState<{
    totalTimeSeconds: number;
    avgTimePerFileSeconds: number;
    successful: number;
    failed: number;
  } | null>(null);
  const userId = getUserId();
  
  // Model selection state
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Company context state
  const [companyName, setCompanyName] = useState<string>(() => localStorage.getItem('nexus_company_name') || '');
  const [companyGSTIN, setCompanyGSTIN] = useState<string>(() => localStorage.getItem('nexus_company_gstin') || '');
  const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>(() => 
    (localStorage.getItem('nexus_transaction_type') as 'purchase' | 'sale') || 'purchase'
  );

  useEffect(() => {
    fetchModels();

    // Connect Socket.io and join user room
    const socket = getSocket();
    joinUserRoom(userId);

    const handleJobUpdate = (job: BatchJob) => {
      setBatchJobs(prev =>
        prev.map(j => (j.id === job.id ? { ...j, ...job } : j))
      );
    };

    const handleBatchComplete = (stats: any) => {
      setBatchStats(stats);
    };

    socket.on('job:queued', handleJobUpdate);
    socket.on('job:processing', handleJobUpdate);
    socket.on('job:completed', handleJobUpdate);
    socket.on('job:failed', handleJobUpdate);
    socket.on('batch:complete', handleBatchComplete);

    return () => {
      socket.off('job:queued', handleJobUpdate);
      socket.off('job:processing', handleJobUpdate);
      socket.off('job:completed', handleJobUpdate);
      socket.off('job:failed', handleJobUpdate);
      socket.off('batch:complete', handleBatchComplete);
    };
  }, [userId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // Persist company settings
  useEffect(() => {
    localStorage.setItem('nexus_company_name', companyName);
  }, [companyName]);
  useEffect(() => {
    localStorage.setItem('nexus_company_gstin', companyGSTIN);
  }, [companyGSTIN]);
  useEffect(() => {
    localStorage.setItem('nexus_transaction_type', transactionType);
  }, [transactionType]);

  const fetchModels = async () => {
    try {
      const availableModels = await getAvailableModels();
      if (availableModels.length === 0) {
        setModelsError('No models found. Please ensure Ollama is running and you have downloaded a model.');
        setModels([]);
      } else {
        setModels(availableModels);
        setModelsError(null);
        const savedModel = localStorage.getItem('nexus_selected_model');
        if (savedModel && availableModels.includes(savedModel)) {
          setSelectedModel(savedModel);
        } else {
          setSelectedModel(availableModels[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setModelsError('Server unreachable. Could not load models.');
      setModels([]);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedModel(val);
    localStorage.setItem('nexus_selected_model', val);
  };

  const handleFileUpload = async (files: File[]) => {
    setError(null);

    // Build company context
    const companyContext: CompanyContext | undefined = companyName.trim()
      ? { companyName: companyName.trim(), companyGSTIN: companyGSTIN.trim(), transactionType }
      : undefined;

    // Single file = synchronous
    if (files.length === 1) {
      setLoading(true);
      setExtractionTime(null);
      setRawResponse(null);
      setLoadingStatus('Uploading and analyzing document...');
      const startTime = Date.now();

      try {
        setLoadingStatus('Extracting text and running AI inference (this may take up to 20 seconds)...');
        const extractedData = await extractInvoice(files[0], selectedModel, companyContext);

        setLoadingStatus('Processing raw model response...');
        if ((extractedData as any).error) {
          throw new Error((extractedData as any).error);
        }

        setCurrentInvoice(extractedData);
        setRawResponse(JSON.stringify(extractedData, null, 2));
        const timeTaken = (Date.now() - startTime) / 1000;
        setExtractionTime(timeTaken.toFixed(1));
      } catch (err: any) {
        setError(err.message || 'An error occurred during extraction.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Multiple files = batch mode via job queue
    try {
      const response = await submitBatchExtraction(files, selectedModel, userId, companyContext);
      setBatchJobs(prev => [...response.jobs, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to submit batch extraction.');
    }
  };

  const handleViewBatchResult = useCallback((invoice: GSTInvoice, jobId: string) => {
    setCurrentInvoice(invoice);
    setRawResponse(JSON.stringify(invoice, null, 2));
    setActiveJobId(jobId);
    
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleSaveInvoice = async (invoice: GSTInvoice) => {
    setError(null);
    try {
      await saveInvoice(invoice);
      setCurrentInvoice(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice.');
    }
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 pb-20">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6 group">
        <svg className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      {/* Page title */}
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Invoice Scanner</h1>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-6 py-4 mb-8 rounded-xl flex items-center shadow-lg shadow-rose-500/5 backdrop-blur-sm animate-pulse">
          <svg className="w-6 h-6 mr-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <strong>Error:</strong> <span className="ml-2">{error}</span>
        </div>
      )}

      {/* Configuration Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        {/* AI Model Setup */}
        <div className="flex gap-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-slate-700/50 shadow-xl shadow-indigo-500/5">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            AI Model Setup
          </h3>
          <p className="text-sm text-slate-400 mb-4">Select the Ollama vision/text model to process your invoice.</p>
          
          {modelsError ? (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex flex-col items-center text-center">
              <svg className="w-8 h-8 text-rose-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm font-medium text-rose-300">{modelsError}</span>
              <p className="text-xs text-slate-400 mt-2">Ensure Ollama is running on localhost:11434</p>
              <button onClick={fetchModels} className="mt-4 px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors">Retry</button>
            </div>
          ) : (
            <div className="space-y-2 max-w-sm">
              <label className="text-sm font-medium text-slate-300">Active Model</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-900/50 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 appearance-none shadow-sm cursor-pointer"
                  value={selectedModel}
                  onChange={handleModelChange}
                  disabled={models.length === 0}
                >
                  {models.length === 0 ? (
                    <option value="">Loading models...</option>
                  ) : (
                    models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {models.length > 0 && (
                <div className="flex items-center mt-3 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1.5 rounded-full w-max border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Connected to Ollama
                </div>
              )}
            </div>
          )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700/50">

            {!loading && extractionTime !== null && (
              <div className="mb-6 flex h-24 items-center space-x-3 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 text-sm shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Extraction completed in <strong>{extractionTime}s</strong>.</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-500/50 rounded-2xl bg-indigo-500/10 transition-all">
                <div className="w-16 h-16 mb-6 relative">
                  <svg className="animate-spin text-indigo-400 w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Processing Invoice...</h3>
                <p className="text-slate-400 text-center max-w-md">{loadingStatus}</p>
                <div className="mt-6 flex items-center space-x-2 text-indigo-300 bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/30">
                  <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-mono font-medium">{elapsedTime}s elapsed</span>
                </div>
              </div>
            ) : (
              <UploadZone onFileUpload={handleFileUpload} />
            )}
          </div>
        </div>

        {/* Company Context */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-slate-700/50 shadow-xl shadow-indigo-500/5">
          <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <svg className="w-5 h-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Your Company
          </h3>
          <p className="text-sm text-slate-400 mb-4">Used to identify buyer/seller roles automatically.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Company Name</label>
              <input
                type="text"
                placeholder="e.g. ABC Enterprises"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 block">Company GSTIN</label>
              <input
                type="text"
                placeholder="e.g. 27AAACW5722A1ZP"
                value={companyGSTIN}
                onChange={(e) => setCompanyGSTIN(e.target.value.toUpperCase())}
                maxLength={15}
                className="w-full p-2.5 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-mono transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Transaction Type</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-600 max-w-sm">
                <button
                  onClick={() => setTransactionType('purchase')}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    transactionType === 'purchase'
                      ? 'bg-sky-500/20 text-sky-300 border-r border-sky-500/30 shadow-inner'
                      : 'bg-slate-900/50 text-slate-400 border-r border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                  Purchase
                </button>
                <button
                  onClick={() => setTransactionType('sale')}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    transactionType === 'sale'
                      ? 'bg-emerald-500/20 text-emerald-300 shadow-inner'
                      : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Sale
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {transactionType === 'purchase' 
                  ? '📥 Your company is the Buyer' 
                  : '📤 Your company is the Seller'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Operations & Status */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Batch Progress Panel */}
          {batchJobs.length > 0 && (
            <BatchProgress 
              jobs={batchJobs} 
              onViewResult={handleViewBatchResult} 
              activeJobId={activeJobId}
              batchStats={batchStats}
            />
          )}

          {/* Raw JSON Console */}
          {(rawResponse !== null || currentInvoice) && (
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 border border-slate-700/50 rounded-2xl shadow-xl font-mono text-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                <h3 className="text-slate-300 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 15V9a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z" /></svg>
                  Raw Response Console
                </h3>
              </div>
              <div className="overflow-auto max-h-[400px] text-slate-400 whitespace-pre-wrap break-words">
                {rawResponse !== null ? (
                  <span className="text-emerald-300">{rawResponse || '(Empty response returned by model)'}</span>
                ) : (
                  <span className="text-emerald-300">{JSON.stringify(currentInvoice, null, 2)}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Review Invoice Details */}
        <div ref={formRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both scroll-mt-24">
          {currentInvoice && (
            <InvoiceForm
              initialData={currentInvoice}
              onSave={handleSaveInvoice}
              onCancel={() => setCurrentInvoice(null)}
            />
          )}
        </div>
      </div>
    </main>
  );
};
