import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UploadZone } from '../components/UploadZone';
import { BankStatementForm } from '../components/BankStatementForm';
import { extractBankStatement, getAvailableModels } from '../api/client';
import { type BankStatement } from '../shared/bankStatementSchema';

export const BankStatementScanner = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentStatement, setCurrentStatement] = useState<BankStatement | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [extractionTime, setExtractionTime] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  // Model selection state
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

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

  const fetchModels = async () => {
    try {
      const availableModels = await getAvailableModels();
      setModels(availableModels);
      setModelsError(null);
      const savedModel = localStorage.getItem('nexus_selected_model');
      if (savedModel && availableModels.includes(savedModel)) {
        setSelectedModel(savedModel);
      } else if (availableModels.length > 0) {
        setSelectedModel(availableModels[0]);
      }
    } catch (err: any) {
      console.error(err);
      setModelsError('Server unreachable. Could not load models.');
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedModel(val);
    localStorage.setItem('nexus_selected_model', val);
  };

  const handleFileUpload = async (files: File[]) => {
    setError(null);

    if (files.length !== 1) {
      setError('Please upload one bank statement at a time.');
      return;
    }

    setLoading(true);
    setExtractionTime(null);
    setRawResponse(null);
    setLoadingStatus('Uploading and analyzing bank statement...');
    const startTime = Date.now();

    try {
      setLoadingStatus('Extracting text and running AI inference (this may take up to 30 seconds)...');
      const extractedData = await extractBankStatement(files[0], selectedModel);

      setLoadingStatus('Processing raw model response...');
      if ((extractedData as any).error) {
        throw new Error((extractedData as any).error);
      }

      setCurrentStatement(extractedData);
      setRawResponse(JSON.stringify(extractedData, null, 2));
      const timeTaken = (Date.now() - startTime) / 1000;
      setExtractionTime(timeTaken.toFixed(1));

      // Scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: any) {
      setError(err.message || 'An error occurred during extraction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6 pb-20">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors mb-6 group">
        <svg className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      {/* Page title */}
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/30">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Bank Statement Scanner</h1>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 px-6 py-4 mb-8 rounded-xl flex items-center shadow-lg shadow-rose-500/5 backdrop-blur-sm animate-pulse">
          <svg className="w-6 h-6 mr-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <strong>Error:</strong> <span className="ml-2">{error}</span>
        </div>
      )}

      {/* Model + Upload Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        {/* AI Model + Upload */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-slate-700/50 shadow-xl shadow-emerald-500/5">
          <h3 className="text-lg font-semibold text-slate-200 mb-2 flex items-center">
            <svg className="w-5 h-5 text-emerald-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            AI Model Setup
          </h3>
          <p className="text-sm text-slate-400 mb-4">Select the model to process your bank statement.</p>

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
                  className="w-full bg-slate-900/50 border border-slate-600 text-slate-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-3 appearance-none shadow-sm cursor-pointer"
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

          <div className="mt-8 pt-8 border-t border-slate-700/50">
            {!loading && extractionTime !== null && (
              <div className="mb-6 flex items-center space-x-3 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/20 text-sm shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Extraction completed in <strong>{extractionTime}s</strong>. Found <strong>{currentStatement?.transactions.length || 0}</strong> transactions.</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-emerald-500/50 rounded-2xl bg-emerald-500/10 transition-all">
                <div className="w-16 h-16 mb-6 relative">
                  <svg className="animate-spin text-emerald-400 w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Processing Bank Statement...</h3>
                <p className="text-slate-400 text-center max-w-md">{loadingStatus}</p>
                <div className="mt-6 flex items-center space-x-2 text-emerald-300 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                  <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-mono font-medium">{elapsedTime}s elapsed</span>
                </div>
              </div>
            ) : (
              <UploadZone onFileUpload={handleFileUpload} />
            )}
          </div>
        </div>

        {/* Raw JSON Console */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-slate-700/50 shadow-xl shadow-emerald-500/5">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M4 15V9a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z" /></svg>
            Raw Response Console
          </h3>
          <div className="overflow-auto max-h-[500px] font-mono text-sm text-slate-400 whitespace-pre-wrap break-words bg-slate-950/50 rounded-xl p-4 border border-slate-700/30">
            {rawResponse ? (
              <span className="text-emerald-300">{rawResponse}</span>
            ) : (
              <span className="text-slate-600 italic">Upload a bank statement to see the raw extraction result here...</span>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {currentStatement && (
        <div ref={formRef} className="animate-in fade-in slide-in-from-bottom-4 duration-700 scroll-mt-24">
          <BankStatementForm
            initialData={currentStatement}
            onCancel={() => { setCurrentStatement(null); setRawResponse(null); }}
          />
        </div>
      )}
    </main>
  );
};
