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
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20"
    >
      <motion.div variants={item} className="relative mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full blur opacity-30 dark:opacity-40 animate-pulse-slow"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-full p-3 shadow-xl">
          <svg 
            className="w-12 h-12 md:w-16 md:h-16 text-blue-600 dark:text-blue-400" 
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
      
      <motion.div variants={item} className="text-center max-w-2xl px-4 mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-gradient from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            智能对话助手
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          欢迎体验 <span className="font-semibold text-blue-600 dark:text-blue-400">DeepSeek R1</span> 智能对话，支持多模型切换，流畅中文与英文，适合知识问答、代码、写作、办公、学习等多场景。
        </p>
      </motion.div>
    </motion.div>
  );
}; 