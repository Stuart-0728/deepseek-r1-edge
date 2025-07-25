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
    <div className="max-w-3xl mx-auto">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mb-6 last:mb-0 ${message.role === 'assistant' ? 'bg-gray-50 dark:bg-gray-700/50 -mx-4 px-4 py-4 md:rounded-xl' : ''}`}
        >
          <div className="flex items-start">
            {/* 头像 */}
            <div className="flex-shrink-0 mr-2 md:mr-4">
              {message.role === 'assistant' ? (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            
            {/* 消息内容 */}
            <div className="flex-1 overflow-hidden">
              {/* 角色名称 */}
              <div className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                {message.role === 'assistant' ? 'ChatGPT' : '您'}
              </div>
              
              {/* 消息内容 */}
              <div className="overflow-hidden">
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {message.content}
                  </div>
                ) : (
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-relaxed prose-pre:my-3 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-md prose-code:text-black dark:prose-code:text-white prose-code:before:content-none prose-code:after:content-none prose-headings:mt-4 prose-headings:mb-2">
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
                                  padding: '0.75rem',
                                  margin: '0.5rem 0',
                                  fontSize: '0.875rem',
                                  borderRadius: '0.375rem',
                                }}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            );
                          }
                          return (
                            <code className="px-1.5 py-0.5 rounded text-black dark:text-white bg-gray-100 dark:bg-gray-800" {...props}>
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
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 