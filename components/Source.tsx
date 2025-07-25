'use client';

import * as React from 'react';
import { useState } from 'react';

export const Source = ({
  sources,
  t
}: {
  sources: { url: string; title: string }[];
  t: (en: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 mb-3">
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
        {t('References')} ({sources.length})
      </button>
      
      {isOpen && (
        <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sources.map((source, index) => (
              <li key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start text-sm"
                >
                  <svg
                    className="w-4 h-4 mt-0.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-blue-600 dark:text-blue-400 line-clamp-1">
                    {source.title || source.url}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 