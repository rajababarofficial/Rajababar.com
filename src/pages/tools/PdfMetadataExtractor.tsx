import React, { useState, useRef, ChangeEvent } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';

// Data ka structure define karne ke liye interface
interface PdfRow {
  [key: string]: string | number;
}

// 1. Yahan naam PdfMetadataExtractor kar diya taake App.tsx se match kare
const PdfMetadataExtractor: React.FC = () => {
  const [filesData, setFilesData] = useState<PdfRow[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 100) {
      alert("Limit Exceeded! Aap sirf 100 files tak select kar sakte hain.");
      return;
    }

    setIsProcessing(true);
    const allResults: PdfRow[] = [];
    const customKeysFound = new Set<string>();
    const systemKeys = ['File_Name', 'Title', 'Author', 'Pages'];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
        
        const info: PdfRow = {
          File_Name: file.name,
          Title: pdfDoc.getTitle() || '',
          Author: pdfDoc.getAuthor() || '',
          Pages: pdfDoc.getPageCount(),
        };

        // Custom fields extraction
        const infoDictObj = pdfDoc.context.lookup(pdfDoc.catalog.get(pdfDoc.context.obj('Info')));
        const infoDict = infoDictObj as any; 
        
        if (infoDict && typeof infoDict.entries === 'function') {
          infoDict.entries().forEach(([key, value]: [any, any]) => {
            const kn = key.asName();
            const standardKeys = ['Title', 'Author', 'Subject', 'Creator', 'Producer', 'CreationDate', 'ModDate'];
            if (!standardKeys.includes(kn)) {
              const val = value.toString().replace(/^\(|\)$/g, '').trim();
              info[kn] = val;
              customKeysFound.add(kn);
            }
          });
        }
        allResults.push(info);
      } catch (err) {
        console.error("Error reading:", file.name, err);
      }
    }

    const finalCols = [...systemKeys, ...Array.from(customKeysFound).sort()];
    setFilesData(allResults);
    setAvailableColumns(finalCols);
    setSelectedColumns(finalCols);
    setIsProcessing(false);
  };

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const downloadFile = () => {
    if (filesData.length === 0) return;

    const filteredData = filesData.map(row => {
      const newRow: PdfRow = {};
      selectedColumns.forEach(col => {
        newRow[col] = row[col] !== undefined ? row[col] : '';
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PDF_Metadata");

    const fileName = `Metadata_Report.${exportFormat}`;
    if (exportFormat === 'csv') {
      XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
    } else if (exportFormat === 'xlsx') {
      XLSX.writeFile(workbook, fileName);
    } else if (exportFormat === 'ods') {
      XLSX.writeFile(workbook, fileName, { bookType: 'ods' });
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#ffffff', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>📄 PDF Metadata Professional</h2>
      
      <div 
        style={{ border: '2px dashed #3498db', padding: '40px', textAlign: 'center', borderRadius: '12px', backgroundColor: '#f8fbff', marginBottom: '25px', cursor: 'pointer' }} 
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" multiple accept=".pdf" 
          onChange={handleFileChange} 
          ref={fileInputRef}
          style={{ display: 'none' }} 
        />
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📤</div>
        <button style={{ padding: '12px 25px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
          Select PDF Files
        </button>
        <p style={{ marginTop: '15px', color: '#7f8c8d' }}>Selected: <b>{filesData.length}</b> / 100 files</p>
      </div>

      {isProcessing && <div style={{ textAlign: 'center', padding: '20px', color: '#e67e22', fontWeight: 'bold' }}>⚡ Processing PDFs... Please wait</div>}

      {availableColumns.length > 0 && (
        <div style={{ backgroundColor: '#fdfdfd', padding: '20px', borderRadius: '10px', border: '1px solid #eee', marginBottom: '25px' }}>
          <h4 style={{ marginTop: '0', color: '#2c3e50', borderBottom: '2px solid #3498db', display: 'inline-block', paddingBottom: '5px' }}>Column Selection</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginTop: '15px' }}>
            {availableColumns.map(col => (
              <label key={col} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px', border: '1px solid #f0f0f0', borderRadius: '6px', backgroundColor: selectedColumns.includes(col) ? '#eef7fe' : '#fff' }}>
                <input 
                  type="checkbox" 
                  checked={selectedColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  style={{ marginRight: '10px', width: '16px', height: '16px' }}
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      )}

      {filesData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '15px', fontWeight: '600', color: '#34495e' }}>Export As:</label>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', cursor: 'pointer' }}>
              <option value="csv">CSV (LibreOffice/Excel)</option>
              <option value="xlsx">Excel Workbook (.xlsx)</option>
              <option value="ods">OpenDocument (.ods)</option>
            </select>
          </div>
          
          <button 
            onClick={downloadFile}
            style={{ padding: '15px 35px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)' }}
          >
            Download {exportFormat.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
};

// 2. Export default bilkul wahi naam hona chahiye jo upar use kiya hai
export default PdfMetadataExtractor;