// Components/ExcelManagerView.tsx
import React, { useRef, useState } from 'react';
import { FileSpreadsheet, Trash2, Upload, Database, Calendar, Edit2, Check, X as XIcon, Table } from 'lucide-react';
import { ImportedExcel, ExcelRow } from '../types';
import { Language } from '../App';
// 1. 引入库，而不是依赖 window
import * as XLSX from 'xlsx';

interface ExcelManagerViewProps {
  language: Language;
  excelFiles: ImportedExcel[];
  setExcelFiles: React.Dispatch<React.SetStateAction<ImportedExcel[]>>;
}

export const ExcelManagerView: React.FC<ExcelManagerViewProps> = ({ language, excelFiles, setExcelFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const t = {
      zh: {
          title: '数据源管理',
          desc: '管理用于重命名的 Excel 映射表数据。',
          upload: '导入新文件',
          no_data: '暂无 Excel 数据',
          rows: '行',
          cols: '列',
          delete: '删除',
          date: '导入日期',
          drag_drop: '拖拽文件至此或点击上传',
          supported: '支持 .xlsx, .xls, .csv',
          save: '保存',
          cancel: '取消',
          search_ph: '搜索表格...'
      },
      en: {
          title: 'Data Sources',
          desc: 'Manage Excel mapping data for renaming tasks.',
          upload: 'Import New File',
          no_data: 'No Excel Data',
          rows: 'rows',
          cols: 'cols',
          delete: 'Delete',
          date: 'Date',
          drag_drop: 'Drag & Drop files or Click to Upload',
          supported: 'Supports .xlsx, .xls, .csv',
          save: 'Save',
          cancel: 'Cancel',
          search_ph: 'Search sheets...'
      }
  }[language];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newExcels: ImportedExcel[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const data = await parseExcel(file);
            newExcels.push(data);
        } catch (err) {
            console.error(`Error parsing ${file.name}`, err);
        }
    }

    setExcelFiles(prev => [...prev, ...newExcels]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseExcel = (file: File): Promise<ImportedExcel> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => {
              try {
                  const bstr = evt.target?.result;
                  // 2. 直接使用 XLSX，去掉 window 前缀
                  const wb = XLSX.read(bstr, { type: 'binary' });
                  const wsname = wb.SheetNames[0];
                  const ws = wb.Sheets[wsname];

                  // Handle Merged Cells
                  if (ws['!merges']) {
                    ws['!merges'].forEach((merge: any) => {
                        // 3. 使用 XLSX.utils
                        const masterAddress = XLSX.utils.encode_cell(merge.s);
                        const masterCell = ws[masterAddress];
                        if (masterCell) {
                            for (let r = merge.s.r; r <= merge.e.r; ++r) {
                                for (let c = merge.s.c; c <= merge.e.c; ++c) {
                                    const cellAddress = XLSX.utils.encode_cell({ c, r });
                                    ws[cellAddress] = Object.assign({}, masterCell); 
                                }
                            }
                        }
                    });
                  }

                  const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
                  
                  // --- Smart Header Detection ---
                  let headerRowIndex = 0;
                  let maxScore = -1;

                  data.slice(0, 20).forEach((row, idx) => {
                      const nonEmptyCells = row.filter(c => c !== undefined && c !== null && String(c).trim() !== '');
                      if (nonEmptyCells.length === 0) return;

                      const uniqueValues = new Set(nonEmptyCells.map(c => String(c).trim()));
                      const uniqueRatio = uniqueValues.size / nonEmptyCells.length;
                      
                      const score = nonEmptyCells.length * Math.pow(uniqueRatio, 2); 

                      if (score > maxScore) {
                          maxScore = score;
                          headerRowIndex = idx;
                      }
                  });
                  
                  if (maxScore <= 0) headerRowIndex = 0;

                  const headers = data[headerRowIndex].map((h: any) => String(h || '').trim()).filter(h => h);
                  const rows = XLSX.utils.sheet_to_json(ws, { header: headers, range: headerRowIndex + 1 }) as ExcelRow[];

                  resolve({
                      id: Math.random().toString(36).substr(2, 9),
                      name: file.name,
                      headers: headers,
                      data: rows,
                      uploadTime: Date.now()
                  });
              } catch (e) {
                  reject(e);
              }
          };
          reader.readAsBinaryString(file);
      });
  };

  const deleteExcel = (id: string) => {
      setExcelFiles(prev => prev.filter(f => f.id !== id));
  };

  const startRename = (file: ImportedExcel) => {
      setEditingId(file.id);
      setEditName(file.name);
  };

  const saveRename = (id: string) => {
      if (editName.trim()) {
          setExcelFiles(prev => prev.map(f => f.id === id ? { ...f, name: editName.trim() } : f));
      }
      setEditingId(null);
  };

  const filteredFiles = excelFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6">
        <style>{`
          .twitter-search-form { --input-text-color: #374151; --input-bg-color: #f3f4f6; --focus-input-bg-color: transparent; --text-color: #9ca3af; --active-color: #3b82f6; --width-of-input: 240px; --inline-padding-of-input: 1.2em; --gap: 0.9rem; }
          .dark .twitter-search-form { --input-text-color: #e5e7eb; --input-bg-color: #1f2937; --text-color: #6b7280; }
          .twitter-search-form { font-size: 0.9rem; display: flex; gap: 0.5rem; align-items: center; width: var(--width-of-input); position: relative; isolation: isolate; }
          .fancy-bg { position: absolute; width: 100%; inset: 0; background: var(--input-bg-color); border-radius: 30px; height: 100%; z-index: -1; pointer-events: none; box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px; }
          .twitter-search-label { width: 100%; padding: 0.8em; height: 42px; padding-inline: var(--inline-padding-of-input); display: flex; align-items: center; }
          .search-icon-wrapper, .close-btn { position: absolute; }
          .search-icon-wrapper { fill: var(--text-color); left: var(--inline-padding-of-input); }
          .search-icon-wrapper svg { width: 17px; display: block; }
          .close-btn { border: none; right: var(--inline-padding-of-input); box-sizing: border-box; display: flex; align-items: center; justify-content: center; color: #fff; padding: 0.1em; width: 20px; height: 20px; border-radius: 50%; background: var(--active-color); opacity: 0; visibility: hidden; cursor: pointer; transition: opacity 0.2s; }
          .twitter-input { color: var(--input-text-color); width: 100%; margin-inline: min(2em,calc(var(--inline-padding-of-input) + var(--gap))); background: none; border: none; }
          .twitter-input:focus { outline: none; }
          .twitter-input::placeholder { color: var(--text-color) }
          .twitter-input:focus ~ .fancy-bg { border: 1px solid var(--active-color); background: var(--focus-input-bg-color); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
          .twitter-input:focus ~ .search-icon-wrapper { fill: var(--active-color); }
          .twitter-input:valid ~ .close-btn { opacity: 1; visibility: visible; }
        `}</style>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 shrink-0">
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Database className="text-blue-600" />
                        {t.title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t.desc}</p>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                    <form className="twitter-search-form" onSubmit={(e) => e.preventDefault()}>
                        <label className="twitter-search-label" htmlFor="search">
                          <input 
                            className="twitter-input" 
                            type="text" 
                            required 
                            placeholder={t.search_ph}
                            id="search" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <div className="fancy-bg" />
                          <div className="search-icon-wrapper">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" /></g></svg>
                          </div>
                          <button className="close-btn" type="reset" onClick={() => setSearchQuery("")}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </button>
                        </label>
                    </form>

                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                    <div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            multiple 
                            onChange={handleFileUpload} 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Upload size={18} />
                            {t.upload}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
             {excelFiles.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 border-2 border-dashed border-gray-100 dark:border-gray-700 m-6 rounded-xl">
                     <FileSpreadsheet size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
                     <p className="font-medium text-lg">{t.no_data}</p>
                     <p className="text-sm mt-2">{t.drag_drop}</p>
                     <p className="text-xs mt-1 text-gray-400">{t.supported}</p>
                 </div>
             ) : (
                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                     {filteredFiles.length === 0 && searchQuery ? (
                         <div className="text-center py-10 text-gray-400">
                             <p>未找到匹配 "{searchQuery}" 的结果</p>
                             <button onClick={() => setSearchQuery("")} className="text-blue-500 hover:underline mt-2 text-sm">清除搜索</button>
                         </div>
                     ) : (
                         filteredFiles.map(file => (
                             <div key={file.id} className="group relative bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all hover:border-blue-300 dark:hover:border-blue-700 flex flex-col md:flex-row items-start md:items-center gap-4">
                                 <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg shrink-0">
                                     <FileSpreadsheet size={24} />
                                 </div>
                                 <div className="flex-1 min-w-0 w-full md:w-auto">
                                     <div className="flex items-center gap-2 mb-1">
                                        {editingId === file.id ? (
                                            <div className="flex items-center gap-1 w-full max-w-md animate-pop-in">
                                                <input 
                                                    autoFocus
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 min-w-0 text-sm font-bold bg-white dark:bg-gray-800 border-b-2 border-blue-500 outline-none text-gray-900 dark:text-gray-100 py-0.5"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveRename(file.id);
                                                        if (e.key === 'Escape') setEditingId(null);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <button onClick={() => saveRename(file.id)} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 p-1 rounded"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded"><XIcon size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className="group/title flex items-center gap-2">
                                                <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate text-base" title={file.name}>{file.name}</h3>
                                                <button onClick={() => startRename(file)} className="opacity-0 group-hover/title:opacity-100 text-gray-400 hover:text-blue-600 transition-all p-1" title="重命名"><Edit2 size={14} /></button>
                                            </div>
                                        )}
                                     </div>
                                     <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                         <span className="flex items-center gap-1"><Table size={12}/> {file.data.length} {t.rows}</span>
                                         <span className="w-px h-3 bg-gray-300 dark:bg-gray-600"></span>
                                         <span>{file.headers.length} {t.cols}</span>
                                         <span className="w-px h-3 bg-gray-300 dark:bg-gray-600"></span>
                                         <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(file.uploadTime).toLocaleDateString()}</span>
                                     </div>
                                 </div>
                                 <div className="hidden md:flex gap-1.5 flex-wrap justify-end max-w-xs lg:max-w-md">
                                     {file.headers.slice(0, 4).map(h => (
                                         <span key={h} className="text-[11px] px-2 py-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 truncate max-w-[100px]">{h}</span>
                                     ))}
                                     {file.headers.length > 4 && <span className="text-[10px] text-gray-400 self-center">+{file.headers.length - 4}</span>}
                                 </div>
                                 <div className="shrink-0 flex items-center self-start md:self-center ml-auto md:ml-0">
                                     <button onClick={() => deleteExcel(file.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t.delete}><Trash2 size={18} /></button>
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
             )}
        </div>
    </div>
  );
};