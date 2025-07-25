'use client';

import * as React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ThinkDrawer = ({ 
  content, 
  t 
}: { 
  content: string; 
  t: (en: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <svg
          className={`w-4 h-4 mr-1 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        {t('Thinking Process')}
      </button>
      
      {isOpen && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 overflow-auto max-h-[400px]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm dark:prose-invert max-w-none"
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}; 