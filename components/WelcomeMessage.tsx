import * as React from 'react';
import { motion } from 'framer-motion';

interface WelcomeMessageProps {
  show: boolean;
  t: (en: string) => string;
  onExampleClick?: (query: string) => void;
}

export const WelcomeMessage = ({ 
  show, 
  t,
  onExampleClick
}: WelcomeMessageProps) => {
  if (!show) return null;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const cardHover = {
    scale: 1.02,
    y: -2
  };

  const examples = [
    {
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: "编程助手",
      description: "帮我用Python实现一个猜数字游戏，包含基本的输入验证和提示",
      query: "帮我用Python实现一个猜数字游戏，包含基本的输入验证和提示",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "知识解答",
      description: "用简单的语言解释量子计算，就像我是一个10岁的孩子",
      query: "用简单的语言解释量子计算，就像我是一个10岁的孩子",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "学习计划",
      description: "为初学者制定一个30天的机器学习入门学习计划",
      query: "为初学者制定一个30天的机器学习入门学习计划",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: "写作助手",
      description: "写一篇关于人工智能对未来工作影响的800字文章",
      query: "写一篇关于人工智能对未来工作影响的800字文章",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-4xl mx-auto px-4 text-center"
    >
      <motion.div className="text-center mb-8">
        <motion.h1 
          variants={item}
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent"
        >
          🤖 智能对话助手
        </motion.h1>
        
        <motion.p
          variants={item}
          className="text-xl mb-2 text-gray-700 dark:text-gray-200 font-medium"
        >
          欢迎使用 DeepSeek R1 智能对话系统
        </motion.p>
        
        <motion.p
          variants={item}
          className="text-base text-gray-500 dark:text-gray-400"
        >
          选择下方示例开始对话，或直接输入您的问题
        </motion.p>
      </motion.div>
      
      <motion.div 
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {examples.map((example, index) => (
          <motion.div
            key={index}
            whileHover={cardHover}
            onClick={() => onExampleClick?.(example.query)}
            className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-transparent transition-all duration-300 cursor-pointer text-left group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${example.gradient} flex items-center justify-center mr-4 shadow-lg`}>
                  {example.icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {example.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                {example.description}
              </p>
            </div>
            
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <motion.div 
        variants={item}
        className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-6 py-3 rounded-full inline-block border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        💡 请从下方输入框开始您的提问，或点击示例问题快速开始
      </motion.div>
    </motion.div>
  );
};