import React from 'react';
import { type BatchJob } from '../api/client';
import { type GSTInvoice } from '../shared/schema';

interface BatchProgressProps {
  jobs: BatchJob[];
  onViewResult: (invoice: GSTInvoice, jobId: string) => void;
  activeJobId?: string | null;
  batchStats?: {
    totalTimeSeconds: number;
    avgTimePerFileSeconds: number;
    successful: number;
    failed: number;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  queued: {
    label: 'Queued',
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  extracting: {
    label: 'OCR',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: (
      <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  formatting_queued: {
    label: 'Waiting AI',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: (
      <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  formatting: {
    label: 'Local processing',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  cloud_processing: {
    label: 'AI processing',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  completed: {
    label: 'Done',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  failed: {
    label: 'Failed',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export const BatchProgress: React.FC<BatchProgressProps> = ({ jobs, onViewResult, activeJobId, batchStats }) => {
  const [liveElapsed, setLiveElapsed] = React.useState(0);

  const completed = jobs.filter(j => j.status === 'completed').length;
  const failed = jobs.filter(j => j.status === 'failed').length;
  const total = jobs.length;
  const progress = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0;

  React.useEffect(() => {
    // Stop ticking if batch is fully complete
    if (progress >= 100 || batchStats) return;

    const interval = setInterval(() => {
      setLiveElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [progress, batchStats]);

  if (jobs.length === 0) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Batch Processing</h3>
            <p className="text-sm text-slate-400">
              {completed + failed} of {total} completed
              {failed > 0 && <span className="text-rose-400"> ({failed} failed)</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-indigo-400">{progress}%</span>
          {!batchStats && progress < 100 && (
            <div className="flex items-center space-x-1 mt-1 text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono">{liveElapsed}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Batch Stats Summary (Shows when complete) */}
      {batchStats && (
        <div className="mb-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between text-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center space-x-2 text-indigo-300 font-medium">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Batch Completed in {batchStats.totalTimeSeconds}s</span>
          </div>
          <div className="text-slate-400">
            Avg: <span className="text-slate-300 font-mono">{batchStats.avgTimePerFileSeconds}s / file</span>
          </div>
        </div>
      )}

      {/* Job list */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {jobs.map((job) => {
          const config = statusConfig[job.status] || statusConfig.cloud_processing;
          const elapsed = job.completedAt && job.startedAt
            ? ((job.completedAt - job.startedAt) / 1000).toFixed(1) + 's'
            : job.startedAt
              ? Math.round((Date.now() - job.startedAt) / 1000) + 's...'
              : '';

          return (
            <div
              key={job.id || job.filename}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                activeJobId === job.id 
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-sm shadow-indigo-500/20' 
                  : 'bg-slate-800/50 border-slate-700/30 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.color}`}>
                  {config.icon}
                  <span>{config.label}</span>
                </div>
                <span className="text-sm text-slate-300 truncate" title={job.filename}>
                  {job.filename}
                </span>
              </div>

              <div className="flex items-center space-x-3 ml-3">
                {elapsed && (
                  <span className="text-xs text-slate-500 font-mono">{elapsed}</span>
                )}
                {job.status === 'completed' && job.result && (
                  <button
                    onClick={() => onViewResult(job.result as GSTInvoice, job.id || '')}
                    className="text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition-colors"
                  >
                    View
                  </button>
                )}
                {job.status === 'failed' && job.error && (
                  <span className="text-xs text-rose-400 truncate max-w-[150px]" title={job.error}>
                    {job.error}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
