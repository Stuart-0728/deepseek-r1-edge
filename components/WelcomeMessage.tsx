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
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-3xl mx-auto px-4 py-8 md:py-12"
    >
      <motion.div variants={item} className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          智能对话助手
        </h1>
        
        <p className="text-base text-gray-600 dark:text-gray-300">
          基于 DeepSeek R1 的智能对话系统，支持多种模型和联网能力
        </p>
      </motion.div>
      
      <motion.div variants={item} className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          您可以这样提问
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">💡 知识问答</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">解释量子计算的基本原理和应用场景</div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">📝 写作辅助</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">撰写一篇关于环保的倡议书，字数约500字</div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">💻 代码帮助</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">用Python实现一个简单的Web爬虫，并解释关键代码</div>
          </div>
          
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">🔍 资料整理</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">总结人工智能在医疗领域的主要应用和未来趋势</div>
          </div>
        </div>
      </motion.div>
      
      <motion.div variants={item} className="text-center text-xs text-gray-500 dark:text-gray-400">
        请从下方输入框开始您的提问，或点击示例问题快速开始
      </motion.div>
    </motion.div>
  );
}; 