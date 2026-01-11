import React from 'react';
import { Construction } from 'lucide-react';

export const PlaceholderView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Construction size={48} className="text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-600 mb-2">功能开发中</h2>
      <p className="text-center max-w-md">
        这个模块暂时保留。未来可能添加批量文件转换、元数据清理或文档内容提取功能。
      </p>
    </div>
  );
};