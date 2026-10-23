import React, { useState, useEffect } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sun, Moon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function WhiteboardPage() {
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync theme with editor when editor mounts
  useEffect(() => {
    if (editor) {
      editor.user.updateUserPreferences({ colorScheme: isDarkMode ? 'dark' : 'light' });
    }
  }, [editor, isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      return alert("Please select a valid PDF file.");
    }
    if (!editor) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Newer versions of pdfjs-dist require { data: arrayBuffer } or url.
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      
      let currentY = 0;
      
      // Load pages sequentially
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Use scale 2.0 for clear text on whiteboard
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create an asset in Tldraw
        const assetId = `asset:pdf-${Date.now()}-${i}`;
        editor.createAssets([{
          id: assetId,
          type: 'image',
          typeName: 'asset',
          meta: {},
          props: {
            w: viewport.width,
            h: viewport.height,
            name: `Page ${i}`,
            isAnimated: false,
            mimeType: 'image/png',
            src: dataUrl,
          },
        }]);

        // Place the shape on the canvas
        editor.createShape({
          type: 'image',
          x: 100, // starting X
          y: currentY + 100, // starting Y
          meta: {},
          props: {
            assetId: assetId,
            w: viewport.width,
            h: viewport.height,
          }
        });
        
        // Add spacing for next page
        currentY += viewport.height + 50;
      }
      
      // Focus camera on the first page
      editor.zoomToFit();
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      alert("Failed to process the PDF.");
    } finally {
      setIsProcessing(false);
      // reset file input
      e.target.value = null;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#121212] overflow-hidden flex flex-col font-sans">
      {/* Top Navbar */}
      <div className="h-14 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 justify-between z-10 shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-medium bg-[#2d2d2d] hover:bg-[#3d3d3d] px-3 py-1.5 rounded-md shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="w-[1px] h-6 bg-[#444] mx-2"></div>
          <h1 className="text-white font-bold tracking-wider text-lg hidden md:block">
            QodeQuant <span className="text-blue-500">Whiteboard</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 hover:text-white rounded-md transition shadow-sm"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <label className={`text-sm font-medium px-4 py-1.5 rounded-md shadow-sm transition flex items-center gap-2 ${isProcessing ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'}`}>
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin" /> Processing PDF...</>
            ) : (
              <>Import PDF to Canvas</>
            )}
            <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={isProcessing} />
          </label>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex overflow-hidden">
        {/* Tldraw Canvas */}
        <div className="flex-1 h-full relative tldraw-dark">
          <Tldraw persistenceKey="qodequant-whiteboard" onMount={(ed) => setEditor(ed)} />
        </div>
      </div>
    </div>
  );
}
