export interface ExcelRow {
  [key: string]: any;
  __rowNum__?: number;
}

export interface ImportedExcel {
  id: string;
  name: string;
  headers: string[];
  data: ExcelRow[];
  uploadTime: number;
}

export interface FileItem {
  name: string;
  extension: string;
  handle?: FileSystemFileHandle; // Native file handle
  matchedRow?: ExcelRow;
  newName?: string;
  status: 'pending' | 'success' | 'error' | 'skipped';
  errorMessage?: string;
  path?: string; // 【新增】Electron 环境下文件的真实路径
}

export type TokenType = 'field' | 'text';

export interface RuleToken {
  id: string;
  type: TokenType;
  value: string;
}

export interface FileTypeRule {
  extension: string;
  enabled: boolean;
  tokens: RuleToken[];
}

export interface AppState {
  excelFiles: ImportedExcel[];
  files: FileItem[];
  fileTypes: string[];
  rules: Record<string, FileTypeRule>;
  isProcessing: boolean;
  folderHandle: FileSystemDirectoryHandle | null;
}

// 【新增】扩展 Window 接口，允许调用 require
declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
    require: (module: string) => any;
  }
}