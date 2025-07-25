import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from './types';
import { Source } from './Source';
import { ThinkDrawer } from './ThinkDrawer';
import { SearchingIndicator } from './SearchingIndicator';
import { MermaidCodeBlock } from './MermaidCodeBlock';
import { motion } from 'framer-motion';

type MessageListProps = {
  messages: Message[];
  isSearching: boolean;
  t: (en: string) => string;
};

export const MessageList = ({ messages, isSearching, t }: MessageListProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 mr-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}
          
          <div
            className={`relative max-w-[85%] ${
              message.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white' 
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
            } px-4 py-3 rounded-lg shadow-sm`}
          >
            {message.role === 'user' && (
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            )}

            {message.role === 'assistant' && (
              <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-md prose-pre:p-3 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-ul:my-4 prose-li:my-0.5 text-sm">
                {message.source && <Source sources={message.source} t={t} />}
                {message.think && <ThinkDrawer content={message.think} t={t} />}
                {message.role === 'assistant' && index === messages.length - 1 && isSearching && !message.content && !message.think && <SearchingIndicator isSearching={isSearching} t={t} />}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      if (language === 'mermaid') {
                        return <MermaidCodeBlock code={String(children).replace(/\n$/, '')} />;
                      }
                      if (match) {
                        return (
                          <SyntaxHighlighter
                            style={prism}
                            language={language}
                            PreTag="div"
                            customStyle={{
                              background: 'transparent',
                              border: 'none',
                              padding: '0.875rem',
                              margin: '0.5rem 0',
                              fontSize: '0.8125rem',
                              borderRadius: '0.375rem',
                              backgroundColor: 'var(--tw-prose-pre-bg)'
                            }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        );
                      }
                      return (
                        <code className="px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30" {...props}>
                          {children}
                        </code>
                      );
                    },
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {message.role === 'user' && (
            <div className="flex-shrink-0 ml-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-sm">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}; 