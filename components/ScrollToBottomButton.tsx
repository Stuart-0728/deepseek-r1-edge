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
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center"
        >
          <button
            onClick={onClick}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all duration-200"
            aria-label="滚动到底部"
          >
            <svg 
              className="w-5 h-5" 
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
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 