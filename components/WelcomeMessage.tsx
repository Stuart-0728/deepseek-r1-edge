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
        className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
      >
        智能对话助手
      </motion.h1>
      
      <motion.p
        variants={item}
        className="text-lg mb-10 text-gray-600 dark:text-gray-300"
      >
        欢迎使用DeepSeek R1智能对话系统，请选择一个话题开始聊天
      </motion.p>
      
      <motion.div 
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8"
      >
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer text-left group"
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-medium text-base text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              编程助手
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-11">
            帮我用Python实现一个猜数字游戏，包含基本的输入验证和提示
          </p>
        </div>
        
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer text-left group"
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-medium text-base text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              知识解答
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-11">
            用简单的语言解释量子计算，就像我是一个10岁的孩子
          </p>
        </div>
        
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer text-left group"
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-medium text-base text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              学习计划
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-11">
            为初学者制定一个30天的机器学习入门学习计划
          </p>
        </div>
        
        <div 
          onClick={() => {}}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 cursor-pointer text-left group"
        >
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-medium text-base text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              写作助手
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 ml-11">
            写一篇关于人工智能对未来工作影响的800字文章
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        variants={item}
        className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full inline-block border border-gray-200 dark:border-gray-700"
      >
        请从下方输入框开始您的提问，或点击示例问题快速开始
      </motion.div>
    </motion.div>
  );
}; 