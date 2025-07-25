import * as React from 'react';
import { motion } from 'framer-motion';

export const WelcomeMessage = ({ 
  show, 
  t 
}: { 
  show: boolean; 
  t: (en: string) => string;
}) => {
  if (!show) return null;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="flex flex-col items-center justify-center py-10 md:py-14"
    >
      <motion.div variants={item} className="relative mb-6">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-25 dark:opacity-40 animate-pulse-slow"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
          <svg 
            className="w-10 h-10 md:w-14 md:h-14 text-blue-500 dark:text-blue-400" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M8 12H16" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 16V8" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>
      
      <motion.div variants={item} className="text-center max-w-2xl px-4 mx-auto space-y-5">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-gradient from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
            智能对话助手
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          欢迎体验 <span className="font-semibold text-blue-500 dark:text-blue-400">DeepSeek R1</span> 智能对话，支持多模型切换，适合知识问答、代码、写作、办公、学习等多场景。
        </p>
        
        <motion.div variants={item} className="pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            请从下方选择一个问题开始，或直接输入您的问题
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 