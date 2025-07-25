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
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="flex flex-col items-center justify-center py-8 md:py-12"
    >
      <motion.div variants={item} className="text-center max-w-2xl px-4 mx-auto space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          智能对话助手
        </h1>
        
        <p className="text-base text-gray-600 dark:text-gray-300">
          欢迎使用 <span className="font-semibold text-blue-500 dark:text-blue-400">DeepSeek R1</span> 智能对话，支持多模型切换，适合知识问答、代码、写作等场景
        </p>
      </motion.div>
    </motion.div>
  );
}; 