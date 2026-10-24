import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Terminal, Play, ArrowLeft, Loader2, Code2, Save, FilePlus, FolderPlus, File, Trash2, Folder, ChevronRight, ChevronDown, Download } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

const DEFAULT_CODE = {
  python: 'print("Hello from QodeQuant!")\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from QodeQuant!");\n    }\n}\n',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from QodeQuant!\\n");\n    return 0;\n}\n',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from QodeQuant!" << std::endl;\n    return 0;\n}\n',
  html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>QodeQuant</title>\n</head>\n<body>\n  <h1>Hello from QodeQuant!</h1>\n</body>\n</html>',
  css: 'body {\n  background-color: #1a1a1a;\n  color: white;\n}\n',
  javascript: 'console.log("Hello from QodeQuant!");\n'
};

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python 3', monacoLang: 'python' },
  { id: 'java', label: 'Java', monacoLang: 'java' },
  { id: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { id: 'c', label: 'C', monacoLang: 'c' },
  { id: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { id: 'html', label: 'HTML', monacoLang: 'html' },
  { id: 'css', label: 'CSS', monacoLang: 'css' }
];

export default function CompilerDashboard() {
  const { lang } = useParams();
  const navigate = useNavigate();
  
  const [language, setLanguage] = useState('python');
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState('output');
  
  const [output, setOutput] = useState('// Output will appear here...\n');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});

  const toggleFolder = (folderName, e) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: prev[folderName] === undefined ? false : !prev[folderName]
    }));
  };
  
  const handleDownloadHomework = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(files));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${language}_homework.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  useEffect(() => {
    let parsedLang = lang;
    if (parsedLang === 'c++') parsedLang = 'cpp';
    
    const targetLang = SUPPORTED_LANGUAGES.find(l => l.id === parsedLang) ? parsedLang : 'python';
    setLanguage(targetLang);

    const savedFiles = localStorage.getItem(`qodequant_files_${targetLang}`);
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles);
        if (parsed && parsed.length > 0) {
          setFiles(parsed);
          setActiveFile(parsed[0].name);
          return;
        }
      } catch (e) { console.error('Parse error', e); }
    }
    
    // Fallback to defaults if no saved files
    const extMap = { python: 'py', java: 'java', cpp: 'cpp', c: 'c', html: 'html', css: 'css', javascript: 'js' };
    const ext = extMap[targetLang] || 'txt';
    const defaultNameMap = { java: 'Main.java', html: 'index.html', css: 'style.css', javascript: 'script.js' };
    const defaultName = defaultNameMap[targetLang] || `main.${ext}`;
    
    setFiles([{ name: defaultName, content: DEFAULT_CODE[targetLang] || '' }]);
    setActiveFile(defaultName);

  }, [lang]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    navigate(`/compiler/${newLang}`);
  };

  const handleSaveCode = () => {
    localStorage.setItem(`qodequant_files_${language}`, JSON.stringify(files));
    setSaveMessage('Saved!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const submitNewFile = () => {
    if (!newFileName || newFileName.trim() === '') {
      setIsCreatingFile(false);
      return;
    }
    
    let finalName = newFileName;
    const activeObj = files.find(f => f.name === activeFile);
    if (activeObj && activeObj.isFolder) {
      finalName = `${activeObj.name}/${newFileName}`;
    }

    if (files.find(f => f.name === finalName)) {
      alert("File already exists!");
      return;
    }
    const newFiles = [...files, { name: finalName, content: '' }];
    setFiles(newFiles);
    setActiveFile(finalName);
    setIsCreatingFile(false);
    setNewFileName('');
  };

  const submitNewFolder = () => {
    if (!newFolderName || newFolderName.trim() === '') {
      setIsCreatingFolder(false);
      return;
    }
    
    let finalName = newFolderName;
    const activeObj = files.find(f => f.name === activeFile);
    if (activeObj && activeObj.isFolder) {
      finalName = `${activeObj.name}/${newFolderName}`;
    }

    if (files.find(f => f.name === finalName)) {
      alert("Folder already exists!");
      return;
    }
    const newFiles = [...files, { name: finalName, isFolder: true, content: '' }];
    setFiles(newFiles);
    setActiveFile(finalName);
    setIsCreatingFolder(false);
    setNewFolderName('');
  };

  const handleNewFileKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitNewFile();
    } else if (e.key === 'Escape') {
      setIsCreatingFile(false);
      setNewFileName('');
    }
  };

  const handleNewFolderKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitNewFolder();
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  const handleDeleteFile = (e, nameToRemove) => {
    e.stopPropagation();
    
    // Check if it's a folder, if so, delete all files inside it too
    const isFolder = files.find(f => f.name === nameToRemove)?.isFolder;
    
    let newFiles;
    if (isFolder) {
       newFiles = files.filter(f => f.name !== nameToRemove && !f.name.startsWith(nameToRemove + '/'));
    } else {
       newFiles = files.filter(f => f.name !== nameToRemove);
    }

    if (newFiles.length === 0) {
      alert("You must have at least one file.");
      return;
    }
    
    setFiles(newFiles);
    if (activeFile === nameToRemove || (isFolder && activeFile.startsWith(nameToRemove + '/'))) {
      setActiveFile(newFiles[0].name);
    }
  };

  const handleCodeChange = (val) => {
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: val || '' } : f));
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput('Compiling & Running code...\n');
    setIsError(false);

    // Save before run automatically
    handleSaveCode();

    try {
      const res = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, files, activeFile, customInput })
      });
      const data = await res.json();
      
      setOutput(data.output || 'Execution finished with no output.');
      setIsError(data.isError || false);
      setActiveTab('output');
    } catch (err) {
      setOutput('Failed to connect to execution server. Ensure backend is running.');
      setIsError(true);
    } finally {
      setIsExecuting(false);
    }
  };

  const activeContent = files.find(f => f.name === activeFile)?.content || '';

  return (
    <div 
      className="h-screen bg-[#050505] flex flex-col font-sans overflow-hidden text-gray-300"
    >
      
      {/* Header */}
      <header className="bg-[#111] border-b border-[#222] px-6 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm font-bold bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333] hover:border-gray-500"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="hidden sm:block">
            <AnimatedLogo />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-[#222] border-r border-[#333]">
               <Code2 size={16} className="text-gray-400" />
            </div>
            <select 
              value={language} 
              onChange={handleLanguageChange}
              className="bg-transparent text-white px-4 py-2 outline-none cursor-pointer appearance-none text-sm font-bold w-28 sm:w-32"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.id} value={l.id} className="bg-[#111] text-white">{l.label}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleRunCode}
            disabled={isExecuting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isExecuting ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
            RUN
          </button>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex-1 flex overflow-hidden relative z-0">
        
        {/* VS Code Style Sidebar (Explorer) */}
        <div className="w-64 flex flex-col bg-[#0a0a0a] border-r border-[#222] shrink-0 select-none">
           <div className="px-4 py-3 flex items-center justify-between border-b border-[#1a1a1a]">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Homework Files</span>
              <div className="flex items-center gap-3">
                 <button onClick={() => { setIsCreatingFile(true); setIsCreatingFolder(false); setNewFileName(''); }} className="text-gray-400 hover:text-blue-400 transition" title="New File">
                    <FilePlus size={16}/>
                 </button>
                 <button onClick={() => { setIsCreatingFolder(true); setIsCreatingFile(false); setNewFolderName(''); }} className="text-gray-400 hover:text-blue-400 transition" title="New Folder">
                    <FolderPlus size={16}/>
                 </button>
              </div>
           </div>
           
           <div className="flex-1 py-2 overflow-y-auto custom-scrollbar">
              {/* Input for new file */}
              {isCreatingFile && (
                 <div className="flex items-center px-4 py-1.5 bg-[#1a1a1a] border-l-[3px] border-blue-500 ml-2 mr-2 mb-1 rounded-r-md">
                    <File size={14} className="text-blue-400 mr-2 shrink-0" />
                    <input 
                      type="text" 
                      autoFocus
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyDown={handleNewFileKeyDown}
                      onBlur={submitNewFile}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-600"
                      placeholder="filename.ext"
                    />
                 </div>
              )}
              {/* Input for new folder */}
              {isCreatingFolder && (
                 <div className="flex items-center px-4 py-1.5 bg-[#1a1a1a] border-l-[3px] border-blue-500 ml-2 mr-2 mb-1 rounded-r-md">
                    <Folder size={14} className="text-blue-400 mr-2 shrink-0" />
                    <input 
                      type="text" 
                      autoFocus
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={handleNewFolderKeyDown}
                      onBlur={submitNewFolder}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder-gray-600"
                      placeholder="folderName"
                    />
                 </div>
              )}

              {/* Render Folders First */}
              {files.filter(f => f.isFolder).map(folder => (
                <div key={folder.name} className="mb-0.5">
                  <div 
                    onClick={() => setActiveFile(folder.name)}
                    className={`group flex items-center justify-between py-1.5 cursor-pointer text-sm transition-all ${activeFile === folder.name ? 'bg-[#1a1a1a] text-blue-400' : 'text-gray-400 hover:bg-[#111] hover:text-gray-300'}`}
                    style={{ paddingLeft: '8px', paddingRight: '16px' }}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden" onClick={(e) => toggleFolder(folder.name, e)}>
                      {expandedFolders[folder.name] !== false ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                      <Folder size={14} className={activeFile === folder.name ? 'text-blue-400 shrink-0' : 'text-gray-500 shrink-0'} fill={expandedFolders[folder.name] !== false ? "currentColor" : "none"} />
                      <span className="truncate font-medium">{folder.name}</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteFile(e, folder.name)} 
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
                      title="Delete Folder"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  {/* Files inside this folder */}
                  {expandedFolders[folder.name] !== false && files.filter(f => !f.isFolder && f.name.startsWith(folder.name + '/')).map(f => (
                    <div 
                      key={f.name} 
                      onClick={() => setActiveFile(f.name)}
                      className={`group flex items-center justify-between py-1.5 cursor-pointer text-sm transition-all ${activeFile === f.name ? 'bg-[#1a1a1a] text-blue-400 border-l-[3px] border-blue-500' : 'text-gray-400 hover:bg-[#111] hover:text-gray-300 border-l-[3px] border-transparent'}`}
                      style={{ paddingLeft: '32px', paddingRight: '16px' }}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <File size={14} className={activeFile === f.name ? 'text-blue-400 shrink-0' : 'text-gray-500 shrink-0'} />
                        <span className="truncate">{f.name.split('/').pop()}</span>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteFile(e, f.name)} 
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
                        title="Delete File"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}

              {/* Render Root Files */}
              {files.filter(f => !f.isFolder && !f.name.includes('/')).map(f => (
                 <div 
                   key={f.name} 
                   onClick={() => setActiveFile(f.name)}
                   className={`group flex items-center justify-between py-1.5 cursor-pointer text-sm transition-all ${activeFile === f.name ? 'bg-[#1a1a1a] text-blue-400 border-l-[3px] border-blue-500' : 'text-gray-400 hover:bg-[#111] hover:text-gray-300 border-l-[3px] border-transparent'}`}
                   style={{ paddingLeft: '16px', paddingRight: '16px' }}
                 >
                   <div className="flex items-center gap-2 overflow-hidden">
                     <File size={14} className={activeFile === f.name ? 'text-blue-400 shrink-0' : 'text-gray-500 shrink-0'} />
                     <span className="truncate">{f.name}</span>
                   </div>
                   {files.length > 1 && (
                      <button 
                        onClick={(e) => handleDeleteFile(e, f.name)} 
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
                        title="Delete File"
                      >
                        <Trash2 size={14} />
                      </button>
                   )}
                 </div>
              ))}
           </div>
        </div>

        {/* Editor Pane (Center) */}
        <div className="flex-1 flex flex-col border-r border-[#222] bg-[#111]">
          <div className="bg-[#1a1a1a] border-b border-[#222] px-4 flex items-center justify-between shadow-sm z-10 h-10">
            {/* Tabs */}
            <div className="flex h-full">
              <div className="px-4 border-r border-l border-[#222] bg-[#111] text-blue-400 text-sm flex items-center gap-2 border-t-2 border-t-blue-500">
                <File size={14} /> {activeFile.split('/').pop()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDownloadHomework} className="text-gray-400 hover:text-white flex items-center gap-1 text-xs font-bold transition bg-[#222] hover:bg-[#333] px-3 py-1 rounded border border-[#333]">
                <Download size={14}/> Export HW
              </button>
              <button onClick={handleSaveCode} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs font-bold transition bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1 rounded border border-blue-500/30">
                <Save size={14}/> {saveMessage || 'Save Work'}
              </button>
            </div>
          </div>
          <div className="flex-1 relative bg-[#111]">
            <Editor
              height="100%"
              theme="vs-dark"
              language={SUPPORTED_LANGUAGES.find(l => l.id === language)?.monacoLang || 'python'}
              value={activeContent}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                renderLineHighlight: 'all'
              }}
            />
          </div>
        </div>
        
        {/* Console Pane (Right) */}
        <div className="w-full md:w-[35%] flex flex-col bg-[#050505]">
           <div className="bg-[#1a1a1a] border-b border-[#222] px-4 h-10 flex items-center justify-between shadow-sm z-10 shrink-0">
             <div className="flex gap-6 h-full">
               <button 
                 onClick={() => setActiveTab('input')}
                 className={`font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-full border-b-2 transition-colors ${activeTab === 'input' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
               >
                 <Terminal size={14} /> Input
               </button>
               <button 
                 onClick={() => setActiveTab('output')}
                 className={`font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-full border-b-2 transition-colors ${activeTab === 'output' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
               >
                 <Terminal size={14} /> Output
               </button>
             </div>
             <button 
               onClick={() => {
                 if (activeTab === 'output') setOutput('// Output cleared\n');
                 else setCustomInput('');
               }} 
               className="text-gray-500 hover:text-white text-xs font-mono transition bg-[#222] hover:bg-[#333] px-2 py-1 rounded"
             >
               Clear
             </button>
           </div>
           
           {activeTab === 'input' ? (
             <textarea 
               value={customInput}
               onChange={(e) => setCustomInput(e.target.value)}
               className="flex-1 bg-transparent text-gray-300 font-mono text-sm p-5 outline-none resize-none custom-scrollbar"
               placeholder="Enter standard input here (e.g. for Scanner or cin)..."
             />
           ) : (
             <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                <pre className={`font-mono text-sm whitespace-pre-wrap leading-relaxed ${isError ? 'text-red-400' : 'text-green-400'}`}>
                  {output}
                </pre>
             </div>
           )}
        </div>
      </main>

    </div>
  );
}
