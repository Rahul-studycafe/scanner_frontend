import React, { useCallback, useState, useRef } from 'react';

interface UploadZoneProps {
  onFileUpload: (files: File[]) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFileUpload(files);
      // Reset input so re-uploading same file works
      e.target.value = '';
    }
  };

  return (
    <div
      className={`relative overflow-hidden group border-2 border-dashed rounded-2xl p-8
         text-center cursor-pointer transition-all duration-300 ease-in-out transform ${
        isDragging 
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-2xl shadow-indigo-500/20' 
          : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf, image/png, image/jpeg"
        multiple
      />
      <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
        <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-slate-700 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-md font-medium text-slate-200">
            {isDragging ? 'Drop invoices here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-slate-400">PDF, JPG, or PNG — Upload multiple files at once</p>
        </div>
      </div>
      
      {/* Decorative glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
    </div>
  );
};
