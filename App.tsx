import React, { useState, useEffect } from 'react';
import { TabSwitcher } from './components/ui/TabSwitcher';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { RenamerView } from './components/RenamerView';
import { ExcelManagerView } from './components/ExcelManagerView';
import { ImportedExcel } from './types';

export type Language = 'zh' | 'en';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('zh');

  // Lifted Excel State with Lazy Initialization for Persistence
  const [excelFiles, setExcelFiles] = useState<ImportedExcel[]>(() => {
    try {
      const saved = localStorage.getItem('renamify_excel_files');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load Excel files from storage", e);
    }
    return [];
  });

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f3f4f6';
    }
  }, [isDarkMode]);

  // Save Excel files to localStorage whenever they change
  useEffect(() => {
    try {
      // Limit storage usage: if data is huge, this might fail. 
      // For a real app, we'd use IndexedDB. For this demo, we assume reasonable file sizes.
      localStorage.setItem('renamify_excel_files', JSON.stringify(excelFiles));
    } catch (e) {
      console.error("Failed to save Excel files to storage (quota exceeded?)", e);
      // Optional: Add UI feedback here if quota exceeded
    }
  }, [excelFiles]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className={`h-screen flex flex-col p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto gap-6 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            Renamify <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Pro</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {language === 'zh' ? '智能批量文件管理系统' : 'Intelligent Bulk File Management'}
          </p>
        </div>

        {/* Center Tabs */}
        <div className="flex-1 flex justify-center w-full md:w-auto">
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
            <ThemeToggle checked={isDarkMode} onChange={setIsDarkMode} />
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
            <button 
                onClick={toggleLanguage}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
                {language === 'zh' ? 'CN' : 'EN'}
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-transparent">
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 0 ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
             <RenamerView language={language} excelFiles={excelFiles} setExcelFiles={setExcelFiles} />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 1 ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
             <ExcelManagerView language={language} excelFiles={excelFiles} setExcelFiles={setExcelFiles} />
        </div>
      </main>

    </div>
  );
};

export default App;