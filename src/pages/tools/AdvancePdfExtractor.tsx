import React, { useState } from "react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";

// Worker Setup (Zaroori hai metadata read karne ke liye)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const AdvancePdfExtractor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const processMetadata = async () => {
    setLoading(true);
    const finalData: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(Math.round((i / files.length) * 100));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        // Metadata Fetching
        const { info, metadata } = await pdf.getMetadata();
        
        // Extracting standard and custom metadata
        const row = {
          "File Name": file.name,
          "Title": (info as any)?.Title || "N/A",
          "Author": (info as any)?.Author || "N/A",
          "Subject": (info as any)?.Subject || "N/A",
          "Keywords": (info as any)?.Keywords || "N/A",
          "Total Pages": pdf.numPages,
          "Creation Date": (info as any)?.CreationDate || "N/A",
          "Producer": (info as any)?.Producer || "N/A",
          // XMP Metadata (Agar file mein hidden fields hain)
          "ISBN": metadata?.get("dc:identifier") || (info as any)?.Custom?.ISBN || "N/A",
          "Publisher": metadata?.get("dc:publisher") || (info as any)?.Custom?.Publisher || "N/A",
          "Language": metadata?.get("dc:language") || "N/A",
          "File Size": (file.size / 1024 / 1024).toFixed(2) + " MB"
        };

        finalData.push(row);
      } catch (err) {
        finalData.push({ "File Name": file.name, "Error": "Corrupted PDF" });
      }
    }

    // Excel Download
    const ws = XLSX.utils.json_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PDF_Metadata");
    XLSX.writeFile(wb, `Metadata_Report_${new Date().getTime()}.xlsx`);

    setLoading(false);
    setFiles([]);
  };

  return (
    <div style={{ padding: '30px', maxWidth: '700px', margin: 'auto', textAlign: 'center' }}>
      <h2 style={{ color: '#333' }}>📋 PDF Metadata Inspector</h2>
      <p style={{ color: '#666' }}>Upload multiple PDFs to extract hidden info like Author, ISBN, etc.</p>
      
      <div style={{ border: '2px dashed #999', padding: '40px', borderRadius: '10px', background: '#fff' }}>
        <input type="file" multiple accept=".pdf" onChange={handleFiles} />
      </div>

      {files.length > 0 && (
        <button 
          onClick={processMetadata} 
          disabled={loading}
          style={{
            marginTop: '20px', padding: '12px 24px', backgroundColor: '#007bff',
            color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}
        >
          {loading ? `Extracting... ${progress}%` : `Extract Metadata from ${files.length} Files`}
        </button>
      )}
    </div>
  );
};

export default AdvancePdfExtractor;