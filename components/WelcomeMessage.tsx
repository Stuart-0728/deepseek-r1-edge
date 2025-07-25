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
        staggerChildren: 0.05,
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
      className="max-w-3xl mx-auto px-4 text-center"
    >
      <motion.h1 
        variants={item}
        className="text-4xl font-bold mb-8 text-gray-800 dark:text-gray-100"
      >
        我们先从哪里开始呢?
      </motion.h1>
      
      <motion.div 
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8"
      >
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-left"
        >
          <h3 className="font-medium text-base mb-2 text-gray-800 dark:text-gray-100">
            帮我写一段代码
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            用Python实现一个猜数字游戏，包含基本的输入验证和提示
          </p>
        </div>
        
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-left"
        >
          <h3 className="font-medium text-base mb-2 text-gray-800 dark:text-gray-100">
            解释一个复杂概念
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            用简单的语言解释量子计算，就像我是一个10岁的孩子
          </p>
        </div>
        
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-left"
        >
          <h3 className="font-medium text-base mb-2 text-gray-800 dark:text-gray-100">
            创建一个学习计划
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            为初学者制定一个30天的机器学习入门学习计划
          </p>
        </div>
        
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer text-left"
        >
          <h3 className="font-medium text-base mb-2 text-gray-800 dark:text-gray-100">
            帮我写文章
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            写一篇关于人工智能对未来工作影响的800字文章
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        variants={item}
        className="text-sm text-gray-500 dark:text-gray-400"
      >
        ChatGPT 也可能会犯错。考虑验证重要信息。
      </motion.div>
    </motion.div>
  );
}; 