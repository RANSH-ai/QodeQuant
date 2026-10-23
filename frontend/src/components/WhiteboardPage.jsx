import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Minus,
  MoveRight,
  Type,
  Hand,
  Undo2,
  Redo2,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Sun,
  Moon,
  Loader2,
  Upload
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const COLORS = [
  '#3b82f6', // Cyber Blue
  '#10b981', // Emerald Green
  '#a855f7', // Purple Neon
  '#ef4444', // Coral Red
  '#f59e0b', // Amber / Gold
  '#06b6d4', // Cyan
  '#ffffff', // White
  '#1e293b', // Slate
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Bold', value: 8 },
  { label: 'Heavy', value: 16 }
];

export default function WhiteboardPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Tools & Settings
  const [tool, setTool] = useState('pen'); // 'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'hand'
  const [color, setColor] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gridMode, setGridMode] = useState('dots'); // 'dots' | 'lines' | 'none'
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);

  // Pan & Zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Elements history
  const [elements, setElements] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Active interaction
  const [isInteracting, setIsInteracting] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Text input state
  const [textInput, setTextInput] = useState(null); // { x, y, canvasX, canvasY, value }

  // Transform screen coordinate to canvas coordinate
  const screenToCanvas = useCallback((screenX, screenY) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom
    };
  }, [pan, zoom]);

  // Redraw Canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Background color
    ctx.fillStyle = isDarkMode ? '#121212' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Apply pan and zoom
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw Grid
    if (gridMode !== 'none') {
      const gridSize = 40;
      const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize;
      const endX = startX + Math.ceil(width / zoom / gridSize) * gridSize + gridSize;
      const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize;
      const endY = startY + Math.ceil(height / zoom / gridSize) * gridSize + gridSize;

      if (gridMode === 'dots') {
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
        for (let x = startX; x <= endX; x += gridSize) {
          for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5 / zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (gridMode === 'lines') {
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
        ctx.lineWidth = 1 / zoom;
        ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) {
          ctx.moveTo(x, startY);
          ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += gridSize) {
          ctx.moveTo(startX, y);
          ctx.lineTo(endX, y);
        }
        ctx.stroke();
      }
    }

    // Render helper for single element
    const renderElement = (el) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'pen' || el.type === 'highlighter') {
        if (!el.points || el.points.length === 0) return;
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
        if (el.type === 'highlighter') {
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = el.width * 2.5;
        }

        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'line') {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
        ctx.beginPath();
        ctx.moveTo(el.start.x, el.start.y);
        ctx.lineTo(el.end.x, el.end.y);
        ctx.stroke();
      } else if (el.type === 'arrow') {
        ctx.strokeStyle = el.color;
        ctx.fillStyle = el.color;
        ctx.lineWidth = el.width;

        // Line body
        ctx.beginPath();
        ctx.moveTo(el.start.x, el.start.y);
        ctx.lineTo(el.end.x, el.end.y);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(el.end.y - el.start.y, el.end.x - el.start.x);
        const headLen = Math.max(12, el.width * 3);
        ctx.beginPath();
        ctx.moveTo(el.end.x, el.end.y);
        ctx.lineTo(
          el.end.x - headLen * Math.cos(angle - Math.PI / 6),
          el.end.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          el.end.x - headLen * Math.cos(angle + Math.PI / 6),
          el.end.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      } else if (el.type === 'rect') {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
        const x = Math.min(el.start.x, el.end.x);
        const y = Math.min(el.start.y, el.end.y);
        const w = Math.abs(el.end.x - el.start.x);
        const h = Math.abs(el.end.y - el.start.y);
        ctx.strokeRect(x, y, w, h);
      } else if (el.type === 'circle') {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
        const radiusX = Math.abs(el.end.x - el.start.x) / 2;
        const radiusY = Math.abs(el.end.y - el.start.y) / 2;
        const centerX = (el.start.x + el.end.x) / 2;
        const centerY = (el.start.y + el.end.y) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === 'text') {
        ctx.fillStyle = el.color;
        ctx.font = `${el.fontSize || 20}px sans-serif`;
        const lines = el.text.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line, el.x, el.y + index * ((el.fontSize || 20) * 1.3));
        });
      } else if (el.type === 'image') {
        if (el.imgElement && el.imgElement.complete) {
          ctx.drawImage(el.imgElement, el.x, el.y, el.width, el.height);
        }
      }

      ctx.restore();
    };

    // Draw all stored elements
    elements.forEach(renderElement);

    // Draw element in progress
    if (currentElement) {
      renderElement(currentElement);
    }

    ctx.restore();
  }, [elements, currentElement, pan, zoom, gridMode, isDarkMode]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redraw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  // Redraw when state changes
  useEffect(() => {
    redraw();
  }, [redraw]);

  // Keyboard Shortcuts (Undo, Redo, Zoom)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (textInput) return; // Don't trigger shortcuts while typing text

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'p') {
        setTool('pen');
      } else if (e.key === 'e') {
        setTool('eraser');
      } else if (e.key === 'h') {
        setTool('hand');
      } else if (e.key === 't') {
        setTool('text');
      } else if (e.key === 'r') {
        setTool('rect');
      } else if (e.key === 'c') {
        setTool('circle');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [elements, redoStack, textInput]);

  // Mouse / Pointer Event Handlers
  const handlePointerDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPoint = screenToCanvas(screenX, screenY);

    if (tool === 'hand' || e.button === 1 || (e.button === 0 && e.spaceKey)) {
      setIsInteracting(true);
      setPanStart({ x: screenX - pan.x, y: screenY - pan.y });
      return;
    }

    if (tool === 'text') {
      setTextInput({
        screenX,
        screenY,
        canvasX: canvasPoint.x,
        canvasY: canvasPoint.y,
        value: ''
      });
      return;
    }

    if (tool === 'eraser') {
      setIsInteracting(true);
      eraseAtPoint(canvasPoint);
      return;
    }

    setIsInteracting(true);
    setRedoStack([]); // Clear redo stack on new action

    if (tool === 'pen' || tool === 'highlighter') {
      setCurrentElement({
        type: tool,
        points: [canvasPoint],
        color,
        width: strokeWidth
      });
    } else if (tool === 'line' || tool === 'arrow' || tool === 'rect' || tool === 'circle') {
      setCurrentElement({
        type: tool,
        start: canvasPoint,
        end: canvasPoint,
        color,
        width: strokeWidth
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!isInteracting) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPoint = screenToCanvas(screenX, screenY);

    if (tool === 'hand') {
      setPan({
        x: screenX - panStart.x,
        y: screenY - panStart.y
      });
      return;
    }

    if (tool === 'eraser') {
      eraseAtPoint(canvasPoint);
      return;
    }

    if (!currentElement) return;

    if (currentElement.type === 'pen' || currentElement.type === 'highlighter') {
      setCurrentElement((prev) => ({
        ...prev,
        points: [...prev.points, canvasPoint]
      }));
    } else if (['line', 'arrow', 'rect', 'circle'].includes(currentElement.type)) {
      setCurrentElement((prev) => ({
        ...prev,
        end: canvasPoint
      }));
    }
  };

  const handlePointerUp = () => {
    if (!isInteracting) return;
    setIsInteracting(false);

    if (currentElement) {
      setElements((prev) => [...prev, currentElement]);
      setCurrentElement(null);
    }
  };

  // Erase items that intersect with clicked point
  const eraseAtPoint = (point) => {
    const threshold = 15;
    setElements((prev) =>
      prev.filter((el) => {
        if (el.type === 'pen' || el.type === 'highlighter') {
          return !el.points.some(
            (p) => Math.hypot(p.x - point.x, p.y - point.y) < threshold + el.width
          );
        }
        if (el.type === 'rect') {
          const minX = Math.min(el.start.x, el.end.x);
          const maxX = Math.max(el.start.x, el.end.x);
          const minY = Math.min(el.start.y, el.end.y);
          const maxY = Math.max(el.start.y, el.end.y);
          return !(point.x >= minX - threshold && point.x <= maxX + threshold &&
                   point.y >= minY - threshold && point.y <= maxY + threshold);
        }
        if (el.type === 'circle') {
          const centerX = (el.start.x + el.end.x) / 2;
          const centerY = (el.start.y + el.end.y) / 2;
          const radius = Math.hypot(el.end.x - el.start.x, el.end.y - el.start.y) / 2;
          return Math.hypot(point.x - centerX, point.y - centerY) > radius + threshold;
        }
        return true;
      })
    );
  };

  // Finish Text Input
  const finishTextInput = () => {
    if (textInput && textInput.value.trim() !== '') {
      setElements((prev) => [
        ...prev,
        {
          type: 'text',
          x: textInput.canvasX,
          y: textInput.canvasY,
          text: textInput.value,
          color,
          fontSize: strokeWidth * 6
        }
      ]);
    }
    setTextInput(null);
  };

  // Undo / Redo / Clear
  const handleUndo = () => {
    if (elements.length === 0) return;
    const last = elements[elements.length - 1];
    setElements((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setElements((prev) => [...prev, next]);
  };

  const handleClear = () => {
    if (elements.length === 0) return;
    if (window.confirm("Are you sure you want to clear the entire whiteboard?")) {
      setElements([]);
      setRedoStack([]);
    }
  };

  // Zoom Controls
  const handleZoom = (delta) => {
    setZoom((prev) => Math.min(3, Math.max(0.3, prev + delta)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export to PNG
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `QodeQuant-Whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Import PDF Pages onto Canvas
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      return alert("Please select a valid PDF file.");
    }

    setIsProcessingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

      let currentY = 50;
      const newImages = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const ctx = tempCanvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const img = new Image();
        img.src = tempCanvas.toDataURL('image/png');
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        newImages.push({
          type: 'image',
          x: 100,
          y: currentY,
          width: viewport.width,
          height: viewport.height,
          imgElement: img,
          src: img.src
        });

        currentY += viewport.height + 40;
      }

      setElements((prev) => [...prev, ...newImages]);
      handleResetView();
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      alert("Failed to process the PDF.");
    } finally {
      setIsProcessingPdf(false);
      e.target.value = null;
    }
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex flex-col font-sans select-none ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-[#f8fafc] text-gray-900'}`}>
      {/* Top Navbar */}
      <header className={`h-14 border-b flex items-center px-4 justify-between z-20 shrink-0 shadow-md ${isDarkMode ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className={`transition flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-[#262626] hover:bg-[#333] border-[#404040] text-gray-200' : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'}`}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <div className={`w-[1px] h-6 mx-1 ${isDarkMode ? 'bg-[#404040]' : 'bg-gray-300'}`}></div>
          <h1 className="font-bold tracking-wide text-base sm:text-lg flex items-center gap-1.5">
            QodeQuant <span className="text-blue-500 font-extrabold">Whiteboard</span>
          </h1>
        </div>

        {/* Center Canvas Stats & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(-0.15)}
            className={`p-1.5 rounded-md hover:scale-105 transition border ${isDarkMode ? 'bg-[#262626] hover:bg-[#333] border-[#404040]' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-mono font-medium px-1.5 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.15)}
            className={`p-1.5 rounded-md hover:scale-105 transition border ${isDarkMode ? 'bg-[#262626] hover:bg-[#333] border-[#404040]' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleResetView}
            className={`p-1.5 rounded-md hover:scale-105 transition border ${isDarkMode ? 'bg-[#262626] hover:bg-[#333] border-[#404040]' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Right Tools (Grid, Theme, PDF, Export) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setGridMode(gridMode === 'dots' ? 'lines' : gridMode === 'lines' ? 'none' : 'dots')}
            className={`p-2 rounded-lg border transition ${isDarkMode ? 'bg-[#262626] hover:bg-[#333] border-[#404040]' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
            title={`Grid: ${gridMode}`}
          >
            <Grid size={16} className={gridMode !== 'none' ? 'text-blue-400' : 'text-gray-400'} />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition ${isDarkMode ? 'bg-[#262626] hover:bg-[#333] border-[#404040]' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'}`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-600" />}
          </button>

          <label className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer ${isProcessingPdf ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
            {isProcessingPdf ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            <span className="hidden md:inline">{isProcessingPdf ? 'Importing...' : 'Import PDF'}</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={isProcessingPdf} />
          </label>

          <button
            onClick={handleExport}
            className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center gap-1.5"
            title="Download Canvas as PNG"
          >
            <Download size={15} />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Board Container */}
      <div ref={containerRef} className="flex-1 w-full relative overflow-hidden">
        {/* Floating Toolbar */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md border ${isDarkMode ? 'bg-[#1e1e1e]/90 border-[#383838]' : 'bg-white/90 border-gray-200'}`}>
          {/* Main Drawing Tools */}
          {[
            { id: 'pen', icon: Pen, title: 'Pen (P)' },
            { id: 'highlighter', icon: Highlighter, title: 'Highlighter' },
            { id: 'eraser', icon: Eraser, title: 'Eraser (E)' },
            { id: 'line', icon: Minus, title: 'Line' },
            { id: 'arrow', icon: MoveRight, title: 'Arrow' },
            { id: 'rect', icon: Square, title: 'Rectangle (R)' },
            { id: 'circle', icon: Circle, title: 'Circle (C)' },
            { id: 'text', icon: Type, title: 'Text (T)' },
            { id: 'hand', icon: Hand, title: 'Pan Tool (H)' }
          ].map((t) => {
            const Icon = t.icon;
            const active = tool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`p-2 rounded-xl transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' : isDarkMode ? 'text-gray-300 hover:bg-[#333]' : 'text-gray-600 hover:bg-gray-100'}`}
                title={t.title}
              >
                <Icon size={18} />
              </button>
            );
          })}

          <div className={`w-[1px] h-6 mx-1 ${isDarkMode ? 'bg-[#383838]' : 'bg-gray-200'}`} />

          {/* Color Palette */}
          <div className="flex items-center gap-1 px-1">
            {COLORS.slice(0, 5).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition border-2 ${color === c ? 'scale-110 border-white ring-2 ring-blue-500' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
                title={`Color: ${c}`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 overflow-hidden"
              title="Custom Color"
            />
          </div>

          <div className={`w-[1px] h-6 mx-1 ${isDarkMode ? 'bg-[#383838]' : 'bg-gray-200'}`} />

          {/* Stroke Width Selector */}
          <div className="flex items-center gap-1">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                onClick={() => setStrokeWidth(sw.value)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition ${strokeWidth === sw.value ? 'bg-blue-600 text-white' : isDarkMode ? 'text-gray-300 hover:bg-[#333]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {sw.label}
              </button>
            ))}
          </div>

          <div className={`w-[1px] h-6 mx-1 ${isDarkMode ? 'bg-[#383838]' : 'bg-gray-200'}`} />

          {/* Undo, Redo, Clear */}
          <button
            onClick={handleUndo}
            disabled={elements.length === 0}
            className={`p-2 rounded-xl transition ${elements.length === 0 ? 'opacity-30 cursor-not-allowed' : isDarkMode ? 'text-gray-300 hover:bg-[#333]' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`p-2 rounded-xl transition ${redoStack.length === 0 ? 'opacity-30 cursor-not-allowed' : isDarkMode ? 'text-gray-300 hover:bg-[#333]' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
          <button
            onClick={handleClear}
            disabled={elements.length === 0}
            className={`p-2 rounded-xl text-red-400 hover:text-red-300 transition ${elements.length === 0 ? 'opacity-30 cursor-not-allowed' : isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
            title="Clear Whiteboard"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`w-full h-full block ${tool === 'hand' ? (isInteracting ? 'cursor-grabbing' : 'cursor-grab') : tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
        />

        {/* In-place Text Input Editor */}
        {textInput && (
          <div
            className="absolute z-40"
            style={{
              left: `${textInput.screenX}px`,
              top: `${textInput.screenY}px`
            }}
          >
            <textarea
              autoFocus
              value={textInput.value}
              onChange={(e) => setTextInput((prev) => ({ ...prev, value: e.target.value }))}
              onBlur={finishTextInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  finishTextInput();
                }
              }}
              placeholder="Type text & hit Enter..."
              className="p-2 border-2 border-blue-500 rounded-lg shadow-xl outline-none resize-none bg-black/80 text-white min-w-[200px]"
              style={{
                fontSize: `${Math.max(14, strokeWidth * 5)}px`,
                color: color
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
