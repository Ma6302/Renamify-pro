import React from 'react';

interface TabSwitcherProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex relative w-[280px] transition-colors">
      {/* Glider Background */}
      <div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-50 dark:bg-blue-900/40 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-0"
        style={{
          left: '4px',
          transform: activeTab === 0 ? 'translateX(0)' : 'translateX(100%)'
        }}
      />

      <button
        onClick={() => onTabChange(0)}
        className={`flex-1 relative z-10 flex items-center justify-center h-9 text-sm font-medium rounded-full transition-colors duration-200 ${
          activeTab === 0 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        重命名任务
      </button>

      <button
        onClick={() => onTabChange(1)}
        className={`flex-1 relative z-10 flex items-center justify-center h-9 text-sm font-medium rounded-full transition-colors duration-200 ${
          activeTab === 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        数据源管理
      </button>
    </div>
  );
};