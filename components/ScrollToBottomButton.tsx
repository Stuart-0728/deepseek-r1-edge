import { motion, AnimatePresence } from 'framer-motion';

export const ScrollToBottomButton = ({ 
  isVisible, 
  onClick 
}: { 
  isVisible: boolean; 
  onClick: () => void; 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-md transition-all"
          aria-label="滚动到底部"
        >
          <svg 
            className="w-5 h-5 text-gray-600 dark:text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}; 