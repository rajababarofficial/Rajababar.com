import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  AlertCircle, 
  Loader2, 
  Table as TableIcon,
  Trash2,
  CheckCircle2,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { cn } from '@/src/utils/cn';
import { SupabaseService } from '@/src/services/supabaseService';

interface PDFMetadata extends Record<string, any> {
  fileName: string;
}

interface FileStatus {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  metadata?: PDFMetadata;
}

export default function PdfMetadataExtractor() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<PDFMetadata[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showFieldModal, setShowFieldModal] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  } as any);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResults(prev => prev.filter((_, i) => files[i]?.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setAvailableFields([]);
    setSelectedFields([]);
  };

  const extractMetadata = async () => {
    setIsExtracting(true);
    const newResults: PDFMetadata[] = [];
    const allKeys = new Set<string>(['fileName']);
    
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const fileStatus = updatedFiles[i];
      if (fileStatus.status === 'completed') {
        if (fileStatus.metadata) {
          newResults.push(fileStatus.metadata);
          Object.keys(fileStatus.metadata).forEach(key => allKeys.add(key));
        }
        continue;
      }

      try {
        updatedFiles[i].status = 'processing';
        setFiles([...updatedFiles]);

        const formData = new FormData();
        formData.append('file', fileStatus.file);

        const response = await fetch('/api/extract-metadata', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to extract metadata from server');
        }

        const data = await response.json();
        const rawMeta = data.metadata;
        
        // Flatten or clean up metadata from ExifTool
        const metadata: PDFMetadata = {
          fileName: fileStatus.file.name,
          ...rawMeta
        };

        // Remove binary or internal fields if they exist to keep it clean
        delete metadata.SourceFile;
        delete metadata.Directory;
        delete metadata.FilePermissions;
        delete metadata.ExifToolVersion;

        updatedFiles[i].status = 'completed';
        updatedFiles[i].metadata = metadata;
        newResults.push(metadata);
        Object.keys(metadata).forEach(key => allKeys.add(key));

        // Log usage and save result
        try {
          await SupabaseService.logToolUsage('pdf-metadata', { fileName: fileStatus.file.name });
          await SupabaseService.saveResult('pdf-metadata', metadata);
        } catch (e) {
          console.warn('Failed to log usage or save result:', e);
        }

      } catch (error: any) {
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = error.message || 'Failed to parse PDF';
      }
      setFiles([...updatedFiles]);
    }

    setResults(newResults);
    const fields = Array.from(allKeys).filter(k => k !== 'SourceFile' && k !== 'errors');
    setAvailableFields(fields);
    setSelectedFields(fields);
    setIsExtracting(false);
    if (newResults.length > 0) {
      setShowFieldModal(true);
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;
    
    // Filter results to only include selected fields
    const filteredResults = results.map(res => {
      const filtered: Record<string, any> = {};
      selectedFields.forEach(field => {
        filtered[field] = res[field] ?? 'N/A';
      });
      return filtered;
    });

    const csv = Papa.unparse(filteredResults);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pdf_metadata_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
            <FileSearch className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-gradient tracking-tight">Bulk PDF Metadata Extractor</h1>
        </div>
        <p className="text-brand-secondary text-lg max-w-2xl">
          Upload multiple PDF files to extract titles, authors, creation dates, and other embedded metadata in bulk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & List */}
        <div className="lg:col-span-1 space-y-6">
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer",
              isDragActive ? "border-brand-accent bg-brand-accent/5" : "border-brand-border bg-brand-surface/30 hover:border-brand-secondary"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mx-auto mb-4">
              <Upload className={cn("w-8 h-8 transition-colors", isDragActive ? "text-brand-accent" : "text-brand-secondary")} />
            </div>
            <p className="text-sm font-bold mb-1">Click or drag PDFs here</p>
            <p className="text-xs text-brand-secondary">Supports multiple files</p>
          </div>

          <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center">
                Queue
                <span className="ml-2 px-2 py-0.5 rounded-md bg-brand-bg text-[10px] text-brand-secondary border border-brand-border">
                  {files.length}
                </span>
              </h3>
              {files.length > 0 && (
                <button onClick={clearAll} className="text-xs text-red-500 hover:underline flex items-center">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              <AnimatePresence initial={false}>
                {files.length === 0 ? (
                  <p className="text-center py-8 text-sm text-brand-secondary italic">No files in queue</p>
                ) : (
                  files.map((fileStatus) => (
                    <motion.div
                      key={fileStatus.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border group"
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className={cn(
                          "w-5 h-5 shrink-0",
                          fileStatus.status === 'completed' ? "text-emerald-500" : 
                          fileStatus.status === 'error' ? "text-red-500" : "text-brand-secondary"
                        )} />
                        <span className="text-xs truncate font-medium">{fileStatus.file.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {fileStatus.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-brand-accent" />}
                        {fileStatus.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        {fileStatus.status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                        <button 
                          onClick={() => removeFile(fileStatus.id)}
                          className="text-brand-secondary hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={extractMetadata}
              disabled={files.length === 0 || isExtracting}
              className="w-full mt-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-brand-secondary transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-5 h-5" />
                  Extract Metadata
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Results Table */}
        <div className="lg:col-span-2">
          <div className="h-full p-8 rounded-3xl bg-brand-surface border border-brand-border flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold flex items-center">
                  <TableIcon className="w-5 h-5 mr-2 text-brand-accent" />
                  Extraction Results
                </h3>
                {results.length > 0 && (
                  <button 
                    onClick={() => setShowFieldModal(true)}
                    className="text-xs px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-secondary hover:text-white transition-colors"
                  >
                    Configure Columns
                  </button>
                )}
              </div>
              {results.length > 0 && (
                <button 
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-brand-bg border border-brand-border text-white text-sm font-bold rounded-xl hover:bg-brand-border transition-all flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              )}
            </div>

            <div className="flex-1 overflow-x-auto border border-brand-border rounded-2xl bg-brand-bg">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-brand-surface border-b border-brand-border text-brand-secondary uppercase tracking-widest font-bold sticky top-0 z-10">
                  <tr>
                    {selectedFields.length > 0 ? (
                      selectedFields.map(field => (
                        <th key={field} className="px-4 py-3 whitespace-nowrap">{field}</th>
                      ))
                    ) : (
                      <th className="px-4 py-3">No columns selected</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={selectedFields.length || 1} className="px-4 py-12 text-center text-brand-secondary italic">
                        No results to display. Upload files and click extract.
                      </td>
                    </tr>
                  ) : (
                    results.map((res, i) => (
                      <tr key={i} className="hover:bg-brand-surface/50 transition-colors">
                        {selectedFields.map(field => (
                          <td key={field} className="px-4 py-3 text-brand-secondary truncate max-w-[200px]" title={String(res[field] || 'N/A')}>
                            {String(res[field] || 'N/A')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center text-[10px] text-brand-secondary uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" />
              Secure processing • Privacy protected
            </div>
          </div>
        </div>
      </div>

      {/* Field Selection Modal */}
      <AnimatePresence>
        {showFieldModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFieldModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Select Metadata Fields</h2>
                  <p className="text-sm text-brand-secondary">Choose which columns to display and export.</p>
                </div>
                <button 
                  onClick={() => setShowFieldModal(false)}
                  className="p-2 rounded-full hover:bg-brand-bg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 mb-8 no-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableFields.map(field => (
                    <label 
                      key={field}
                      className={cn(
                        "flex items-center p-3 rounded-xl border transition-all cursor-pointer",
                        selectedFields.includes(field) 
                          ? "bg-brand-accent/10 border-brand-accent/50 text-white" 
                          : "bg-brand-bg border-brand-border text-brand-secondary hover:border-brand-secondary"
                      )}
                    >
                      <input 
                        type="checkbox"
                        className="sr-only"
                        checked={selectedFields.includes(field)}
                        onChange={() => {
                          setSelectedFields(prev => 
                            prev.includes(field) 
                              ? prev.filter(f => f !== field)
                              : [...prev, field]
                          );
                        }}
                      />
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors",
                        selectedFields.includes(field) ? "bg-brand-accent border-brand-accent" : "border-brand-border"
                      )}>
                        {selectedFields.includes(field) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-medium truncate">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-brand-border">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setSelectedFields(availableFields)}
                    className="text-xs text-brand-accent hover:underline"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedFields(['fileName'])}
                    className="text-xs text-brand-secondary hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <button 
                  onClick={() => setShowFieldModal(false)}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-brand-secondary transition-all"
                >
                  Apply Selection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
