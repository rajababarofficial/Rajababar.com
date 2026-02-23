import React, { useState, useCallback, useMemo } from 'react';
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
  Sparkles,
  FileJson,
  FileSpreadsheet,
  Type as TypeIcon,
  Plus,
  Settings2,
  Languages
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { cn } from '@/src/utils/cn';
import { SupabaseService } from '@/src/services/supabaseService';

interface PDFMetadata extends Record<string, any> {
  fileName: string;
}

interface FileStatus {
  file?: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  metadata?: PDFMetadata;
  isManual?: boolean;
}

export default function PdfMetadataExtractor() {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<PDFMetadata[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

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
    accept: { 'application/pdf': ['.pdf'] },
    noClick: false,
    noKeyboard: false
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

  const addManualEntry = () => {
    const id = Math.random().toString(36).substring(7);
    setFiles(prev => [...prev, {
      id,
      status: 'completed',
      isManual: true,
      metadata: { fileName: `Manual Entry ${prev.length + 1}` }
    }]);
    setResults(prev => [...prev, { fileName: `Manual Entry ${files.length + 1}` }]);
    setAvailableFields(prev => prev.length === 0 ? ['fileName'] : prev);
    setSelectedFields(prev => prev.length === 0 ? ['fileName'] : prev);
  };

  const extractMetadata = async () => {
    setIsExtracting(true);
    const newResults: PDFMetadata[] = [];
    const allKeys = new Set<string>(['fileName']);
    
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const fileStatus = updatedFiles[i];
      if (fileStatus.status === 'completed' || fileStatus.isManual) {
        if (fileStatus.metadata) {
          newResults.push(fileStatus.metadata);
          Object.keys(fileStatus.metadata).forEach(key => allKeys.add(key));
        }
        continue;
      }

      if (!fileStatus.file) continue;

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
        
        const metadata: PDFMetadata = {
          fileName: fileStatus.file.name,
          ...rawMeta
        };

        delete metadata.SourceFile;
        delete metadata.Directory;
        delete metadata.FilePermissions;
        delete metadata.ExifToolVersion;

        updatedFiles[i].status = 'completed';
        updatedFiles[i].metadata = metadata;
        newResults.push(metadata);
        Object.keys(metadata).forEach(key => allKeys.add(key));

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

  const exportData = (format: 'csv' | 'xlsx' | 'txt' | 'json') => {
    if (results.length === 0) return;
    
    const filteredResults = results.map(res => {
      const filtered: Record<string, any> = {};
      selectedFields.forEach(field => {
        filtered[field] = res[field] ?? 'N/A';
      });
      return filtered;
    });

    const timestamp = new Date().getTime();
    const filename = `pdf_metadata_${timestamp}`;

    if (format === 'csv') {
      const csv = Papa.unparse(filteredResults);
      downloadFile(csv, `${filename}.csv`, 'text/csv');
    } else if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(filteredResults);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Metadata");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else if (format === 'json') {
      downloadFile(JSON.stringify(filteredResults, null, 2), `${filename}.json`, 'application/json');
    } else if (format === 'txt') {
      const txt = filteredResults.map(res => 
        Object.entries(res).map(([k, v]) => `${k}: ${v}`).join('\n')
      ).join('\n\n---\n\n');
      downloadFile(txt, `${filename}.txt`, 'text/plain');
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent">
              <FileSearch className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-gradient tracking-tight">Bulk PDF Metadata Extractor</h1>
          </div>
          <p className="text-brand-secondary text-lg max-w-2xl">
            Professional-grade metadata extraction. Upload PDFs or enter data manually to generate structured reports.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsRTL(!isRTL)}
            className={cn(
              "p-3 rounded-xl border transition-all flex items-center space-x-2",
              isRTL ? "bg-brand-accent text-white border-brand-accent" : "bg-brand-surface border-brand-border text-brand-secondary hover:text-brand-primary"
            )}
            title="Toggle RTL Support"
          >
            <Languages className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">RTL</span>
          </button>
          <button 
            onClick={addManualEntry}
            className="p-3 rounded-xl border border-brand-border bg-brand-surface text-brand-secondary hover:text-brand-primary transition-all flex items-center space-x-2"
            title="Add Manual Entry"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Manual</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Queue */}
        <div className="lg:col-span-1 space-y-6">
          <div 
            {...getRootProps()} 
            className={cn(
              "ios-card p-8 text-center transition-all cursor-pointer border-2 border-dashed",
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

          <div className="ios-card p-6 bg-brand-surface">
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
                        <span className="text-xs truncate font-medium">{fileStatus.file?.name || fileStatus.metadata?.fileName}</span>
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
              className="w-full mt-6 ios-button bg-brand-primary text-brand-bg flex items-center justify-center"
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
          <div className="h-full ios-card p-8 bg-brand-surface flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold flex items-center">
                  <TableIcon className="w-5 h-5 mr-2 text-brand-accent" />
                  Results
                </h3>
                {results.length > 0 && (
                  <button 
                    onClick={() => setShowFieldModal(true)}
                    className="text-[10px] px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-secondary hover:text-brand-primary transition-colors uppercase tracking-widest font-bold"
                  >
                    <Settings2 className="w-3 h-3 inline mr-1" />
                    Columns
                  </button>
                )}
              </div>
              
              {results.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest mr-2">Export:</span>
                  <button onClick={() => exportData('csv')} className="p-2 rounded-lg bg-brand-bg border border-brand-border hover:text-brand-accent transition-colors" title="Export CSV"><FileSpreadsheet className="w-4 h-4" /></button>
                  <button onClick={() => exportData('xlsx')} className="p-2 rounded-lg bg-brand-bg border border-brand-border hover:text-emerald-500 transition-colors" title="Export Excel"><Download className="w-4 h-4" /></button>
                  <button onClick={() => exportData('json')} className="p-2 rounded-lg bg-brand-bg border border-brand-border hover:text-yellow-500 transition-colors" title="Export JSON"><FileJson className="w-4 h-4" /></button>
                  <button onClick={() => exportData('txt')} className="p-2 rounded-lg bg-brand-bg border border-brand-border hover:text-brand-primary transition-colors" title="Export Text"><TypeIcon className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <div 
              className={cn(
                "flex-1 overflow-auto border border-brand-border rounded-2xl bg-brand-bg",
                isRTL && "text-right"
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-brand-surface border-b border-brand-border text-brand-secondary uppercase tracking-widest font-bold sticky top-0 z-10">
                  <tr>
                    {selectedFields.length > 0 ? (
                      selectedFields.map(field => (
                        <th key={field} className={cn("px-4 py-4 whitespace-nowrap", isRTL && "text-right")}>{field}</th>
                      ))
                    ) : (
                      <th className="px-4 py-4">No columns selected</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={selectedFields.length || 1} className="px-4 py-16 text-center text-brand-secondary italic">
                        <div className="flex flex-col items-center justify-center opacity-50">
                          <FileSearch className="w-12 h-12 mb-4" />
                          <p>No results to display. Upload files and click extract.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    results.map((res, i) => (
                      <tr key={i} className="hover:bg-brand-surface/50 transition-colors">
                        {selectedFields.map(field => (
                          <td 
                            key={field} 
                            className={cn(
                              "px-4 py-4 text-brand-secondary truncate max-w-[200px]",
                              isRTL && "text-right"
                            )} 
                            title={String(res[field] || 'N/A')}
                          >
                            {String(res[field] || 'N/A')}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-[10px] text-brand-secondary uppercase tracking-widest font-bold">
              <div className="flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" />
                Secure processing • Privacy protected
              </div>
              <div>
                {results.length} Entries Found
              </div>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-3xl p-8 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Configure Columns</h2>
                  <p className="text-sm text-brand-secondary">Select metadata fields to display in your report.</p>
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
                        "flex items-center p-4 rounded-2xl border transition-all cursor-pointer",
                        selectedFields.includes(field) 
                          ? "bg-brand-accent/10 border-brand-accent/50 text-brand-primary" 
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
                        "w-5 h-5 rounded-lg border flex items-center justify-center mr-3 transition-colors",
                        selectedFields.includes(field) ? "bg-brand-accent border-brand-accent" : "border-brand-border"
                      )}>
                        {selectedFields.includes(field) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-medium truncate">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-brand-border">
                <div className="flex space-x-6">
                  <button 
                    onClick={() => setSelectedFields(availableFields)}
                    className="text-xs font-bold uppercase tracking-widest text-brand-accent hover:opacity-80 transition-opacity"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedFields(['fileName'])}
                    className="text-xs font-bold uppercase tracking-widest text-brand-secondary hover:opacity-80 transition-opacity"
                  >
                    Clear All
                  </button>
                </div>
                <button 
                  onClick={() => setShowFieldModal(false)}
                  className="ios-button bg-brand-primary text-brand-bg px-10"
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
