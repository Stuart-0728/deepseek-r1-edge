import * as React from 'react';

export const SearchingIndicator = ({ 
  isSearching, 
  t 
}: { 
  isSearching: boolean; 
  t: (en: string) => string;
}) => {
  if (!isSearching) return null;

  return (
    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 py-1">
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span className="text-sm">{t('Processing')}</span>
    </div>
  );
}; 