import React, { useState, useEffect, useRef } from 'react';
import { Upload, FolderOpen, FileSpreadsheet, Plus, X, Play, RefreshCw, CheckCircle, AlertCircle, Trash2, Edit3, Save, CheckSquare, Square, Database } from 'lucide-react';
import { ExcelRow, FileItem, FileTypeRule, RuleToken, TokenType, AppState, ImportedExcel } from '../types';
import { Checkbox } from './ui/Checkbox';
import { Language } from '../App';
import * as XLSX from 'xlsx';

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

// Translations
const i18n = {
    zh: {
        step1: '数据源 & 目标',
        step1_desc: '管理数据请前往“数据源管理”页',
        step1_folder: '选择目标文件夹',
        step1_folder_ph: '选择',
        step1_folder_change: '更换',
        step1_import_excel: '关联 Excel 数据表',
        step1_import_temp: '导入excel临时数据表',
        step1_import_desc: '导入包含重命名信息的 Excel 文件',
        step2: '文件类型配置',
        step2_empty: '请先选择文件夹',
        step2_click: '点击配置规则',
        step3: '重命名规则编辑器',
        step3_empty: '请在左侧选择一种文件类型进行配置',
        step3_no_excel: '无 Excel 数据，请先导入',
        step3_hint: '提示: 点击 + 号插入 Excel 字段或自定义文本。',
        excel_col: 'Excel 列',
        custom_text: '自定义文本',
        add: '添加',
        input_ph: '输入文本...',
        queue: '处理队列',
        start_rename: '开始重命名',
        processing: '处理中...',
        status: '状态',
        original_name: '原文件名',
        original_name_tooltip: '原始文件名',
        match_preview: '匹配数据 (预览)',
        new_name: '新文件名',
        status_pending: '待处理',
        status_success: '完成',
        status_fail: '失败',
        status_skip: '已跳过',
        status_source_error: '未匹配目标源',
        no_files: '暂无文件',
        select_all: '全选',
        deselect_all: '取消全选',
        linked_excel: '已关联 Excel 数据'
    },
    en: {
        step1: 'Source & Target',
        step1_desc: 'Manage data in "Data Sources" tab',
        step1_folder: 'Select Target Folder',
        step1_folder_ph: 'Select',
        step1_folder_change: 'Change',
        step1_import_excel: 'Link Excel Data',
        step1_import_temp: 'Import temporary Excel data',
        step1_import_desc: 'Import Excel file containing rename info',
        step2: 'File Types',
        step2_empty: 'Please select a folder first',
        step2_click: 'Click to configure',
        step3: 'Rule Editor',
        step3_empty: 'Select a file type on the left to configure',
        step3_no_excel: 'No Excel data. Please import first',
        step3_hint: 'Tip: Click + to insert Excel fields or custom text.',
        excel_col: 'Excel Columns',
        custom_text: 'Custom Text',
        add: 'Add',
        input_ph: 'Enter text...',
        queue: 'Processing Queue',
        start_rename: 'Start Renaming',
        processing: 'Processing...',
        status: 'Status',
        original_name: 'Original Name',
        original_name_tooltip: 'Original Filename',
        match_preview: 'Matched Data',
        new_name: 'New Name',
        status_pending: 'Pending',
        status_success: 'Done',
        status_fail: 'Failed',
        status_skip: 'Skipped',
        status_source_error: 'Source Mismatch',
        no_files: 'No files',
        select_all: 'Select All',
        deselect_all: 'Deselect All',
        linked_excel: 'Linked Excel Data'
    }
};

const EXT_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  doc: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  docx: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  txt: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  xls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  xlsx: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  ppt: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  pptx: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  jpg: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  jpeg: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  png: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  zip: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  rar: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  '7z': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  mp3: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  wav: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  mp4: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  avi: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  mov: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
};

const FALLBACK_STYLE = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

const getExtColor = (ext: string) => EXT_COLORS[ext.toLowerCase()] || FALLBACK_STYLE;

// Separator for namespacing
const FIELD_SEPARATOR = ':::';

// --- Sub-Components ---

interface TokenInserterProps {
    ext: string;
    index: number;
    mergedExcelFiles: ImportedExcel[];
    addToken: (ext: string, type: TokenType, value: string, index: number) => void;
    t: any;
}

const TokenInserter: React.FC<TokenInserterProps> = ({ ext, index, mergedExcelFiles, addToken, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customText, setCustomText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAddText = () => {
        if (customText) {
            addToken(ext, 'text', customText, index);
            setCustomText("");
            setIsOpen(false);
        }
    };

    return (
        <div className="relative flex items-center">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all mx-1 z-30 relative"
            >
                <Plus size={14} />
            </button>
            
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 p-3 z-[100] w-72 animate-pop-in">
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">{t.excel_col}</div>
                        
                        <div className="max-h-56 overflow-y-auto mb-3 pr-1 space-y-3">
                            {mergedExcelFiles.map(file => (
                                <div key={file.id}>
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 px-1 truncate" title={file.name}>
                                        {file.name}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {file.headers.map(h => (
                                            <button
                                                key={`${file.id}-${h}`}
                                                onClick={() => { addToken(ext, 'field', `${file.id}${FIELD_SEPARATOR}${h}`, index); setIsOpen(false); }}
                                                className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded hover:bg-indigo-100 border border-indigo-100 dark:border-indigo-800 transition-colors"
                                            >
                                                {h}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider border-t border-gray-100 dark:border-gray-700 pt-2">{t.custom_text}</div>
                        <div className="flex gap-2">
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder={t.input_ph}
                                className="flex-1 text-sm border dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                            />
                            <button 
                                onClick={handleAddText}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                            >
                                {t.add}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

interface TokenBadgeProps {
    token: RuleToken;
    ext: string;
    index: number;
    mergedExcelFiles: ImportedExcel[];
    updateTokenValue: (ext: string, index: number, value: string) => void;
    removeToken: (ext: string, index: number) => void;
}

const TokenBadge: React.FC<TokenBadgeProps> = ({ token, ext, index, mergedExcelFiles, updateTokenValue, removeToken }) => {
     const [isEditing, setIsEditing] = useState(false);
     const [val, setVal] = useState(token.value);

     const handleSave = () => {
         updateTokenValue(ext, index, val);
         setIsEditing(false);
     }

     if (token.type === 'text' && isEditing) {
         return (
             <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 mx-1">
                 <input 
                    autoFocus
                    className="w-20 bg-transparent text-sm outline-none text-gray-800 dark:text-white"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                 />
             </div>
         )
     }

     let displayName = token.value;
     let sourceFileName = "";
     if (token.type === 'field' && token.value.includes(FIELD_SEPARATOR)) {
         const parts = token.value.split(FIELD_SEPARATOR);
         const fileId = parts[0];
         displayName = parts.slice(1).join(FIELD_SEPARATOR);
         
         const sourceFile = mergedExcelFiles.find(f => f.id === fileId);
         if (sourceFile) sourceFileName = sourceFile.name;
     }

     return (
        <div 
            className={`group relative flex items-center px-3 py-1.5 rounded-md text-sm font-medium border shadow-sm mx-1 cursor-default max-w-[200px]
            ${token.type === 'field' 
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' 
                : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
            }`}
            title={sourceFileName ? `Source: ${sourceFileName}` : undefined}
        >
            {token.type === 'field' ? <FileSpreadsheet size={12} className="mr-1.5 opacity-60 shrink-0"/> : <Edit3 size={12} className="mr-1.5 opacity-60 shrink-0" />}
            <span className="truncate">{displayName}</span>
            <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1 z-20">
                 {token.type === 'text' && (
                     <button onClick={() => setIsEditing(true)} className="bg-white dark:bg-gray-700 rounded-full p-0.5 shadow border dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-blue-500">
                        <Edit3 size={10} />
                     </button>
                 )}
                 <button 
                    onClick={() => removeToken(ext, index)}
                    className="bg-white dark:bg-gray-700 text-red-500 dark:text-red-400 rounded-full p-0.5 shadow border dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                 >
                    <X size={10} />
                 </button>
            </div>
        </div>
     );
};

// --- Main Component ---

interface RenamerViewProps {
    language?: Language;
    excelFiles: ImportedExcel[];
    setExcelFiles?: React.Dispatch<React.SetStateAction<ImportedExcel[]>>;
}

export const RenamerView: React.FC<RenamerViewProps> = ({ language = 'zh', excelFiles, setExcelFiles }) => {
  const t = i18n[language];
  
  // 检查是否在 Electron 环境
  const isElectron = typeof window !== 'undefined' && window.navigator.userAgent.toLowerCase().includes('electron');

  const [folderName, setFolderName] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [availableExts, setAvailableExts] = useState<string[]>([]);
  const [rules, setRules] = useState<Record<string, FileTypeRule>>({});
  const [selectedExtForEditing, setSelectedExtForEditing] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [tempFiles, setTempFiles] = useState<ImportedExcel[]>([]);
  
  const mergedExcelFiles = [...excelFiles, ...tempFiles];
  const [allHeaders, setAllHeaders] = useState<string[]>([]);

  useEffect(() => {
    const uniqueHeaders = new Set<string>();
    mergedExcelFiles.forEach(f => f.headers.forEach(h => uniqueHeaders.add(h)));
    const headersList = Array.from(uniqueHeaders);
    setAllHeaders(headersList);
  }, [mergedExcelFiles, availableExts.length]);

  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // --- Actions ---

  const handleFolderFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    const folderPath = rawFiles[0].webkitRelativePath;
    const inferredFolderName = folderPath.split('/')[0] || "已选文件夹";
    setFolderName(inferredFolderName);

    const loadedFiles: FileItem[] = [];
    const exts = new Set<string>();

    for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];
        if (file.name.startsWith('.')) continue;

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const safeExt = ext || 'file'; 
        exts.add(safeExt);
        
        loadedFiles.push({
            name: file.name,
            extension: safeExt,
            status: 'pending',
            // 【关键修复】确保 path 属性被保存（Electron 需要它）
            path: (file as any).path 
        });
    }

    setFiles(loadedFiles);
    const extList = Array.from(exts).sort();
    setAvailableExts(extList);
    initRules(extList);
    if(extList.length > 0) setSelectedExtForEditing(extList[0]);
  };

  const handleFolderSelect = async () => {
    // 【关键修复】Electron 环境下强制使用 Input，确保获取 file.path
    if (isElectron) {
        folderInputRef.current?.click();
        return;
    }

    if (typeof window.showDirectoryPicker === 'function') {
        try {
            const handle = await window.showDirectoryPicker();
            dirHandleRef.current = handle;
            setFolderName(handle.name);

            const loadedFiles: FileItem[] = [];
            const exts = new Set<string>();

            const scanDir = async (dirHandle: FileSystemDirectoryHandle) => {
                // @ts-ignore
                for await (const entry of dirHandle.values()) {
                    if (entry.kind === 'file') {
                        const name = entry.name;
                        if (name.startsWith('.')) continue;

                        const ext = name.split('.').pop()?.toLowerCase() || '';
                        const safeExt = ext || 'file'; 
                        exts.add(safeExt);
                        
                        const fileData = await entry.getFile();
                        loadedFiles.push({
                            name: name,
                            extension: safeExt,
                            handle: entry as FileSystemFileHandle,
                            status: 'pending',
                            // 【关键修复】获取 Web API 返回的 path (如果有)
                            path: (fileData as any).path 
                        });
                    } else if (entry.kind === 'directory') {
                        await scanDir(entry as FileSystemDirectoryHandle);
                    }
                }
            };

            await scanDir(handle);
            setFiles(loadedFiles);
            const extList = Array.from(exts).sort();
            setAvailableExts(extList);
            initRules(extList);
            if(extList.length > 0) setSelectedExtForEditing(extList[0]);
            return;
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.warn("Native FS Access API error, using fallback:", err);
        }
    }
    
    folderInputRef.current?.click();
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newExcels: ImportedExcel[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const data = await parseExcel(file);
            newExcels.push(data);
        } catch (err) {
            console.error(err);
        }
    }
    setTempFiles(prev => [...prev, ...newExcels]);
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const parseExcel = (file: File): Promise<ImportedExcel> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];

                if (ws['!merges']) {
                  ws['!merges'].forEach((merge: any) => {
                      const master = ws[XLSX.utils.encode_cell(merge.s)];
                      if (master) {
                          for (let r = merge.s.r; r <= merge.e.r; ++r) {
                              for (let c = merge.s.c; c <= merge.e.c; ++c) {
                                  ws[XLSX.utils.encode_cell({ c, r })] = Object.assign({}, master);
                              }
                          }
                      }
                  });
                }

                const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
                let headerRowIndex = 0;
                let maxScore = -1;
                data.slice(0, 20).forEach((row, idx) => {
                    const cells = row.filter(c => c && String(c).trim() !== '');
                    if (!cells.length) return;
                    const u = new Set(cells.map(c => String(c).trim())).size / cells.length;
                    const score = cells.length * Math.pow(u, 2);
                    if (score > maxScore) { maxScore = score; headerRowIndex = idx; }
                });
                
                const headers = data[headerRowIndex].map((h: any) => String(h || '').trim()).filter(h => h);
                const rows = XLSX.utils.sheet_to_json(ws, { header: headers, range: headerRowIndex + 1 }) as ExcelRow[];

                resolve({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    headers,
                    data: rows,
                    uploadTime: Date.now()
                });
            } catch (e) { reject(e); }
        };
        reader.readAsBinaryString(file);
    });
  };

  // ... (initRules, toggleRuleEnabled, isAllSelected, toggleAllRules, addToken, removeToken, updateTokenValue 保持不变) ...
  const initRules = (exts: string[]) => {
    setRules(prev => {
      const newRules = { ...prev };
      exts.forEach(ext => {
        if (!newRules[ext]) {
          newRules[ext] = { extension: ext, enabled: false, tokens: [] };
        }
      });
      return newRules;
    });
  };
  const toggleRuleEnabled = (ext: string) => {
    setRules(prev => ({ ...prev, [ext]: { ...prev[ext], enabled: !prev[ext].enabled } }));
  };
  const isAllSelected = availableExts.length > 0 && availableExts.every(ext => rules[ext]?.enabled);
  const toggleAllRules = () => {
      const newValue = !isAllSelected;
      setRules(prev => {
          const next = { ...prev };
          availableExts.forEach(ext => { if (next[ext]) next[ext].enabled = newValue; });
          return next;
      });
  };
  const addToken = (ext: string, type: TokenType, value: string, index: number) => {
    setRules(prev => {
      const rule = prev[ext];
      const newTokens = [...rule.tokens];
      newTokens.splice(index, 0, { id: Math.random().toString(36).substr(2, 9), type, value });
      return { ...prev, [ext]: { ...rule, tokens: newTokens } };
    });
  };
  const removeToken = (ext: string, index: number) => {
    setRules(prev => {
      const rule = prev[ext];
      const newTokens = [...rule.tokens];
      newTokens.splice(index, 1);
      return { ...prev, [ext]: { ...rule, tokens: newTokens } };
    });
  };
  const updateTokenValue = (ext: string, index: number, value: string) => {
    setRules(prev => {
        const rule = prev[ext];
        const newTokens = [...rule.tokens];
        newTokens[index] = { ...newTokens[index], value };
        return { ...prev, [ext]: { ...rule, tokens: newTokens } };
    });
  }

  // --- Matching & Renaming Logic ---

  const getReferencedExcelIds = (tokens: RuleToken[]): Set<string> => {
      const ids = new Set<string>();
      tokens.forEach(t => {
          if (t.type === 'field' && t.value.includes(FIELD_SEPARATOR)) {
              ids.add(t.value.split(FIELD_SEPARATOR)[0]);
          }
      });
      return ids;
  };

  const findMatch = (filename: string): ExcelRow | undefined => {
    let aggregatedRow: ExcelRow | undefined = undefined;

    for (const file of mergedExcelFiles) {
        const keyColumns = file.headers.filter(h => 
            ['姓名', 'name', '学号', 'id', 'student_id', '工号'].some(k => h.toLowerCase().includes(k))
        );
        const searchCols = keyColumns.length > 0 ? keyColumns : file.headers;

        const found = file.data.find(row => {
            return searchCols.some(col => {
                const val = String(row[col] || '').trim();
                if (val.length < 2) return false; 
                return filename.includes(val);
            });
        });
        
        if (found) {
            if (!aggregatedRow) aggregatedRow = {};
            Object.keys(found).forEach(key => {
                if (key === '__rowNum__') return;
                aggregatedRow![`${file.id}${FIELD_SEPARATOR}${key}`] = found[key];
            });
        }
    }
    return aggregatedRow;
  };

  const generateNewName = (row: ExcelRow, tokens: RuleToken[], originalExt: string) => {
    let name = "";
    tokens.forEach(token => {
        if (token.type === 'text') {
            name += token.value;
        } else {
            const val = row[token.value];
            name += (val !== undefined && val !== null) ? val : ''; 
        }
    });
    name = name.replace(/[<>:"/\\|?*]/g, '_');
    return name + "." + originalExt;
  };

  // 【核心修复】融合了你的功能更新 + Electron 原生 fs 支持
  const runRenaming = async () => {
    setProcessing(true);
    const updatedFiles = [...files];

    // 1. 动态加载 Node 模块 (仅在 Electron 下)
    let fs: any = null;
    let pathModule: any = null;
    if (isElectron) {
        try {
            fs = window.require('fs');
            pathModule = window.require('path');
        } catch (e) {
            console.error("Failed to load Node.js modules.", e);
        }
    }

    for (let i = 0; i < updatedFiles.length; i++) {
        const file = updatedFiles[i];
        const rule = rules[file.extension];

        if (!rule || !rule.enabled || rule.tokens.length === 0) {
            updatedFiles[i].status = 'skipped';
            updatedFiles[i].errorMessage = "未启用规则或规则为空";
            continue;
        }

        const match = findMatch(file.name);
        
        // --- 你的隔离逻辑 (Isolation Logic) ---
        const requiredExcelIds = getReferencedExcelIds(rule.tokens);
        let hasRelevantData = false;

        if (match && requiredExcelIds.size > 0) {
            const matchKeys = Object.keys(match);
            hasRelevantData = matchKeys.some(key => {
                const keyFileId = key.split(FIELD_SEPARATOR)[0];
                return requiredExcelIds.has(keyFileId);
            });
        } else if (match && requiredExcelIds.size === 0) {
            hasRelevantData = true;
        }

        if (!match || !hasRelevantData) {
            updatedFiles[i].status = 'error';
            updatedFiles[i].errorMessage = t.status_source_error;
            updatedFiles[i].matchedRow = undefined; 
            continue;
        }

        updatedFiles[i].matchedRow = match;
        const newName = generateNewName(match, rule.tokens, file.extension);
        updatedFiles[i].newName = newName;

        try {
            // 2. Electron 原生重命名 (优先)
            if (isElectron && fs && pathModule && file.path) {
                const oldPath = file.path;
                
                if (!pathModule.isAbsolute(oldPath)) {
                   throw new Error("无效的文件路径 (Not Absolute)");
                }

                const dir = pathModule.dirname(oldPath);
                const newPath = pathModule.join(dir, newName);

                fs.renameSync(oldPath, newPath);
                
                // 更新路径，以便可以连续重命名
                updatedFiles[i].path = newPath;
                updatedFiles[i].status = 'success';

            } else if (file.handle && (file.handle as any).move) {
                 // 3. 浏览器 Web API 回退
                 // @ts-ignore
                 await file.handle.move(newName);
                 updatedFiles[i].status = 'success';
            } else {
                 throw new Error(isElectron ? "权限错误: 无法获取文件路径" : "浏览器不支持文件重命名");
            }
        } catch (e: any) {
            updatedFiles[i].status = 'error';
            updatedFiles[i].errorMessage = e.message;
        }
    }

    // 排序保持你的逻辑
    updatedFiles.sort((a, b) => {
        if (a.status === 'success' && b.status !== 'success') return -1;
        if (a.status !== 'success' && b.status === 'success') return 1;
        return 0;
    });

    setFiles(updatedFiles);
    setProcessing(false);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left Sidebar: Inputs & Types */}
      <div className="col-span-12 md:col-span-4 flex flex-col gap-4 h-full min-h-0">
        
        {/* Step 1: Data Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 shrink-0 transition-colors">
            <h3 className="text-gray-800 dark:text-white font-bold mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">1</span>
                {t.step1}
            </h3>
            
            <div className="space-y-3">
                <input 
                    type="file" 
                    ref={excelInputRef}
                    accept=".xlsx,.xls,.csv" 
                    multiple 
                    onChange={handleExcelImport}
                    className="hidden" 
                />
                 <input 
                    type="file" 
                    ref={folderInputRef}
                    onChange={handleFolderFallback}
                    className="hidden" 
                    {...({ webkitdirectory: "", directory: "" } as any)} 
                    multiple 
                />

                <div 
                    onClick={mergedExcelFiles.length === 0 ? () => excelInputRef.current?.click() : undefined}
                    className={`relative border-2 rounded-xl p-3 transition-colors group flex items-center gap-3
                        ${mergedExcelFiles.length > 0 
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-800' 
                            : 'border-dashed border-green-200 dark:border-green-800 hover:border-green-400 bg-green-50/30 dark:bg-green-900/10 cursor-pointer'}
                    `}
                >
                    <div className={`p-2 rounded-lg ${
                        mergedExcelFiles.length > 0 
                        ? 'bg-white dark:bg-gray-800 text-green-600' 
                        : 'bg-white dark:bg-gray-800 text-gray-400 group-hover:text-green-600 group-hover:scale-105 transition-transform' 
                    }`}>
                        <FileSpreadsheet size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                            {mergedExcelFiles.length > 0 ? t.linked_excel : t.step1_import_excel}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {mergedExcelFiles.length > 0 ? `${mergedExcelFiles.length} files loaded` : t.step1_import_desc}
                        </p>
                    </div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); excelInputRef.current?.click(); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium z-10 shadow-sm transition-colors border
                            ${mergedExcelFiles.length > 0
                                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900' 
                                : 'bg-green-600 text-white border-transparent hover:bg-green-700'
                            }
                        `}
                        title={t.step1_import_temp}
                    >
                        {mergedExcelFiles.length > 0 ? t.add : t.step1_folder_ph}
                    </button>
                </div>

                <div 
                    onClick={!folderName ? handleFolderSelect : undefined}
                    className={`relative border-2 rounded-xl p-3 transition-colors flex items-center gap-3
                        ${folderName 
                            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800' 
                            : 'border-dashed border-blue-200 dark:border-blue-800 hover:border-blue-400 bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer group'}
                    `}
                >
                    <div className={`p-2 rounded-lg ${folderName ? 'bg-white dark:bg-gray-800 text-blue-600' : 'bg-white dark:bg-gray-800 text-gray-400 group-hover:text-blue-600 group-hover:scale-105 transition-transform'}`}>
                        <FolderOpen size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{folderName || t.step1_folder}</p>
                        {folderName && <p className="text-xs text-gray-500 dark:text-gray-400">{files.length} files</p>}
                    </div>

                    <button 
                        onClick={(e) => {
                             if (folderName) { e.stopPropagation(); handleFolderSelect(); }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium z-10 shadow-sm transition-colors border
                            ${folderName
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900' 
                                : 'bg-gray-800 dark:bg-gray-600 text-white border-transparent group-hover:bg-blue-600'
                            }
                        `}
                    >
                        {folderName ? t.step1_folder_change : t.step1_folder_ph}
                    </button>
                </div>

            </div>
            
            <p className="text-[10px] text-gray-400 mt-2 text-center">{t.step1_desc}</p>
        </div>

        {/* Step 2: File Types */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex-1 overflow-hidden flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800 dark:text-white font-bold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">2</span>
                    {t.step2}
                </h3>
                {availableExts.length > 0 && (
                    <button 
                        onClick={toggleAllRules}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                        {isAllSelected ? (
                            <><CheckSquare size={14} /> {t.deselect_all}</>
                        ) : (
                            <><Square size={14} /> {t.select_all}</>
                        )}
                    </button>
                )}
            </div>
            
            {availableExts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm py-8">
                    <FolderOpen size={32} className="mb-2 opacity-50"/>
                    {t.step2_empty}
                </div>
            ) : (
                <div className="overflow-y-auto pr-1 space-y-2 max-h-full">
                    {availableExts.map(ext => {
                        const rule = rules[ext];
                        const isSelected = selectedExtForEditing === ext;
                        return (
                            <div 
                                key={ext}
                                onClick={() => setSelectedExtForEditing(ext)}
                                className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                    ${isSelected 
                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' 
                                        : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'}
                                `}
                            >
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Checkbox 
                                        checked={rule?.enabled || false}
                                        onChange={() => toggleRuleEnabled(ext)}
                                        color="blue"
                                    />
                                </div>
                                
                                <div className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getExtColor(ext)}`}>
                                    {ext || 'UNKNOWN'}
                                </div>
                                <div className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                                    {rule?.tokens.length > 0 ? (
                                        <div className="flex gap-1 overflow-hidden">
                                            {rule.tokens.map((t, i) => {
                                                const parts = t.value.split(FIELD_SEPARATOR);
                                                const display = parts.length > 1 ? parts.slice(1).join('') : t.value;
                                                return <span key={i} className="truncate max-w-[50px]">{display}</span>;
                                            })}
                                        </div>
                                    ) : t.step2_click}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>

      {/* Right Content: Rules & Status */}
      <div className="col-span-12 md:col-span-8 flex flex-col gap-4 h-full min-h-0">
        
        {/* Rule Editor Area */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 min-h-[200px] shrink-0 transition-colors">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800 dark:text-white font-bold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">3</span>
                    {t.step3}
                </h3>
                {selectedExtForEditing && (
                    <div className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getExtColor(selectedExtForEditing)}`}>
                        {selectedExtForEditing}
                    </div>
                )}
            </div>

            {!selectedExtForEditing ? (
                 <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                    👈 {t.step3_empty}
                 </div>
            ) : mergedExcelFiles.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-orange-400 border-2 border-dashed border-orange-50 bg-orange-50/20 dark:bg-orange-900/10 rounded-xl">
                    ⚠️ {t.step3_no_excel}
                </div>
            ) : (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-8 flex items-center justify-start flex-wrap gap-y-4 min-h-[120px] relative border border-gray-200 dark:border-gray-700 border-dashed">
                    {/* Start Point */}
                    <div className="text-gray-400 text-xs font-medium uppercase mr-2 select-none">Start</div>
                    
                    <TokenInserter 
                        ext={selectedExtForEditing} 
                        index={0} 
                        mergedExcelFiles={mergedExcelFiles}
                        addToken={addToken}
                        t={t}
                    />
                    
                    {rules[selectedExtForEditing]?.tokens.map((token, idx) => (
                        <React.Fragment key={token.id}>
                            <TokenBadge 
                                token={token} 
                                ext={selectedExtForEditing} 
                                index={idx} 
                                mergedExcelFiles={mergedExcelFiles}
                                updateTokenValue={updateTokenValue}
                                removeToken={removeToken}
                            />
                            <TokenInserter 
                                ext={selectedExtForEditing} 
                                index={idx + 1} 
                                mergedExcelFiles={mergedExcelFiles}
                                addToken={addToken}
                                t={t}
                            />
                        </React.Fragment>
                    ))}

                    <div className="text-gray-400 text-xs font-medium uppercase ml-2 select-none">.{selectedExtForEditing}</div>
                </div>
            )}
            
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <p>{t.step3_hint}</p>
            </div>
        </div>

        {/* Action & Logs */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden min-h-0 transition-colors">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/30 shrink-0">
                <div className="font-bold text-gray-700 dark:text-gray-200">{t.queue}</div>
                <button 
                    onClick={runRenaming}
                    disabled={processing || !files.length || mergedExcelFiles.length === 0}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium text-white shadow-lg shadow-blue-500/30 transition-all
                        ${processing || !files.length ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
                    `}
                >
                    {processing ? <RefreshCw className="animate-spin" size={18}/> : <Play size={18} fill="currentColor"/>}
                    {processing ? t.processing : t.start_rename}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 text-gray-500 dark:text-gray-400 font-medium shadow-sm">
                        <tr>
                            <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">{t.status}</th>
                            <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">{t.original_name}</th>
                            <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">{t.match_preview}</th>
                            <th className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">{t.new_name}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {files.map((file, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="px-4 py-3 w-[100px]">
                                    {file.status === 'pending' && <span className="inline-flex items-center text-gray-400 dark:text-gray-500 text-xs"><div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"/>{t.status_pending}</span>}
                                    {file.status === 'success' && <span className="inline-flex items-center text-green-600 dark:text-green-400 text-xs font-medium"><CheckCircle size={14} className="mr-1"/>{t.status_success}</span>}
                                    {file.status === 'error' && <span className="inline-flex items-center text-red-500 dark:text-red-400 text-xs font-medium"><AlertCircle size={14} className="mr-1"/>{t.status_fail}</span>}
                                    {file.status === 'skipped' && <span className="inline-flex items-center text-gray-400 text-xs">{t.status_skip}</span>}
                                </td>
                                
                                <td className="px-4 py-3 max-w-[200px]">
                                    <div className="truncate" title={file.name}>
                                        {file.name}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                    {/* Smart Preview: Only show matches relevant to the active rule for this file type */}
                                    {file.matchedRow && selectedExtForEditing && rules[selectedExtForEditing]
                                        ? (() => {
                                            const ruleIds = getReferencedExcelIds(rules[selectedExtForEditing].tokens);
                                            // Filter entries that belong to the active rule's files
                                            const relevantValues = Object.entries(file.matchedRow)
                                                .filter(([k]) => {
                                                    const fid = k.split(FIELD_SEPARATOR)[0];
                                                    return ruleIds.has(fid);
                                                })
                                                .slice(0, 2)
                                                .map(([, v]) => v)
                                                .join(' | ');
                                            
                                            return relevantValues || (Object.values(file.matchedRow).length > 0 ? "..." : "-");
                                        })()
                                        : '-'}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-[200px] truncate">
                                    {file.newName || '-'}
                                    {file.errorMessage && <span className="text-red-500 ml-2 text-xs">({file.errorMessage})</span>}
                                </td>
                            </tr>
                        ))}
                        {files.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-12 text-gray-300 dark:text-gray-600">
                                    {t.no_files}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};