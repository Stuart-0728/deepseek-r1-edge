'use client';

import * as React from 'react';
import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import debounce from 'lodash/debounce';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';

import { ScrollToBottomButton } from '../components/ScrollToBottomButton';
import { ThinkDrawer } from '../components/ThinkDrawer';
import { MermaidCodeBlock } from '../components/MermaidCodeBlock';
import { WelcomeMessage } from '../components/WelcomeMessage';
import { SearchingIndicator } from '../components/SearchingIndicator';
import { Source } from '../components/Source';
import { Loading } from '../components/Loading';
import { Message, MessageContent, KeywordButton, ModelOption } from '../components/types';
import { MessageList } from '../components/MessageList';

const MODEL_OPTIONS: ModelOption[] = [
  {
    id: '@tx/deepseek-ai/deepseek-r1-distill-qwen-32b',
    name: 'DeepSeek R1 Distill (32B)'
  },
  {
    id: '@tx/deepseek-ai/deepseek-r1-0528',
    name: 'DeepSeek R1 (0528)'
  },
  {
    id: '@tx/deepseek-ai/deepseek-v3-0324',
    name: 'DeepSeek V3 (0324)'
  }
];

export default function Home() {
  // 状态管理
  const [userInput, setUserInput] = useState('');
  const [useNetwork, setUseNetwork] = useState(false);
  const [showKeywords, setShowKeywords] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSiteEnv, setIsSiteEnv] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState('@tx/deepseek-ai/deepseek-v3-0324');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // refs
  const messageRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsSiteEnv(window.location.href.includes('.site'));
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scrollToBottom = () => {
    if (messageRef.current) {
      messageRef.current.scrollTo({
        top: messageRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 翻译函数，确保使用中文
  const t = (en: string) => {
    const map: { [key: string]: string } = {
      'How to write Amazon product titles for wireless earphones with ANC and 40h battery life?':
        '为带有主动降噪和40小时续航的无线耳机写产品标题',
      'Generate a professional email template to handle customer complaints about product quality':
        '生成一个处理产品质量客户投诉的专业邮件模板',
      'Help optimize Python code for quick sort algorithm with time complexity analysis':
        '帮助优化快速排序算法的Python代码并分析时间复杂度',
      'Create a comparison table of marketing strategies between TikTok and Instagram Reels':
        '创建抖音和Instagram Reels营销策略的对比表',
      'Type a message...': '请输入您的问题...',
      'Network: On': '联网: 开启',
      'Network: Off': '联网: 关闭',
      'References': '参考资料',
      'Stop': '停止生成',
      'Model': '模型',
      'DeepSeek R1 Distill (32B)': 'DeepSeek R1 Distill (32B)',
      'DeepSeek R1 (0528)': 'DeepSeek R1 (0528)',
      'DeepSeek V3 (0324)': 'DeepSeek V3 (0324)',
      'Thinking Process': '思考过程',
      'Processing': '处理中',
    };
    return map[en] || en;
  };

  const KEYWORD_BUTTONS: KeywordButton[] = [
    {
      text: '为带有主动降噪和40小时续航的无线耳机写产品标题',
      query: '为带有主动降噪和40小时续航的无线耳机写产品标题',
    },
    {
      text: '生成一个处理产品质量客户投诉的专业邮件模板',
      query: '生成一个处理产品质量客户投诉的专业邮件模板',
    },
    {
      text: '帮助优化快速排序算法的Python代码并分析时间复杂度',
      query: '帮助优化快速排序算法的Python代码并分析时间复杂度',
    },
    {
      text: '创建抖音和Instagram Reels营销策略的对比表',
      query: '创建抖音和Instagram Reels营销策略的对比表',
    },
  ];

  useLayoutEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 640);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const getDisplayButtons = () => {
    if (isMobile) {
      const randomIndex = Math.floor(Math.random() * KEYWORD_BUTTONS.length);
      return [KEYWORD_BUTTONS[randomIndex]];
    }
    return KEYWORD_BUTTONS;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (messageRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messageRef.current;
        const windowHeight = window.innerHeight;
        const contentExceeds70Percent = scrollHeight > windowHeight * 0.7;
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        const isAtBottom = distanceFromBottom <= 20;
        
        setShowScrollButton(contentExceeds70Percent && !isAtBottom);
      }
    };

    if (messageRef.current) {
      messageRef.current.addEventListener('scroll', handleScroll);
      const resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });
      resizeObserver.observe(messageRef.current);

      handleScroll();

      return () => {
        if (messageRef.current) {
          messageRef.current.removeEventListener('scroll', handleScroll);
        }
        resizeObserver.disconnect();
      };
    }
  }, [messages]);

  const handleKeywordClick = (query: string) => {
    setUserInput(query);
    setShowKeywords(false);
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });
  };

  const debouncedUpdateMessage = useCallback(
    debounce((updateFn: (prev: Message[]) => Message[]) => {
      setMessages(updateFn);
    }, 50),
    []
  );

  const processStreamResponse = async (
    response: Response,
    updateMessage: (content: MessageContent) => void
  ) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      setIsSearching(false);
      const errorData = await response.json();
      return updateMessage({
        content:
          errorData?.error || 'Sorry, something went wrong. Please try again.',
      });
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let accumulatedContent = '';
    let accumulatedThink = '';
    let thinking = false;

    setIsStreaming(true);

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (
            !line.trim() ||
            line.includes('[DONE]') ||
            !line.includes('data: ')
          )
            continue;
          try {
            const json = JSON.parse(line.replace(/^data: /, ''));
            const token = json.choices[0]?.delta?.content || '';
            const reasoningToken =
              json.choices[0]?.delta?.reasoning_content || '';

            // Turn off searching indicator when first token arrives
            if (isSearching) {
              setIsSearching(false);
            }

            // Handle think content
            if (
              token.includes('<think>') ||
              token.includes('\u003cthink\u003e')
            ) {
              thinking = true;
              continue;
            }
            if (
              token.includes('</think>') ||
              token.includes('\u003c/think\u003e')
            ) {
              thinking = false;
              continue;
            }

            if (thinking || reasoningToken) {
              accumulatedThink += token || reasoningToken || '';
            } else {
              accumulatedContent += token || '';
            }

            updateMessage({
              content: accumulatedContent,
              think: accumulatedThink,
            });
          } catch (e) {
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Stream error:', error);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    // If already streaming, stop the current response
    if (isStreaming) {
      handleStopResponse();
      return;
    }

    setShowKeywords(false);
    setIsLoading(true);
    setIsSearching(true);
    const currentInput = textareaRef.current?.value || '';
    setUserInput('');

    // Create conversation history
    let conversationHistory = [...messages];

    if (messages[0]?.role === 'assistant') {
      setMessages([]);
      conversationHistory = [];
    }

    // Add new user message
    conversationHistory.push({ role: 'user', content: currentInput });

    // Add empty assistant message that will be streamed
    setMessages([...conversationHistory, { role: 'assistant', content: '' }]);

    setTimeout(() => {
      messageRef.current?.scrollTo(0, messageRef.current?.scrollHeight);
    }, 300);

    try {
      const url =
        process.env.NODE_ENV === 'development'
          ? process.env.NEXT_PUBLIC_BASE_URL!
          : '/v1/chat/completions';

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          network: useNetwork,
          model: selectedModel,
        }),
        signal, // Attach the signal to the fetch request
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      setAnswered(true);

      let source: { url: string; title: string }[] = [];
      res.headers.forEach((value, name) => {
        if (name === 'results') {
          const results = JSON.parse(value);
          source = results.map((result: { url: string; title: string }) => {
            return {
              url: result.url,
              title: decodeURIComponent(result.title),
            };
          });
        }
      });

      setMessages((prev) => {
        const newMessages = structuredClone(prev);
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.source = source;
        return newMessages;
      });

      await processStreamResponse(res, (_content: MessageContent) => {
        debouncedUpdateMessage((prev) => {
          const newMessages = structuredClone(prev);
          const lastMessage = newMessages[newMessages.length - 1];

          if (_content.think) {
            lastMessage.think = _content.think;
          }
          if (_content.content) {
            lastMessage.content = _content.content;
          }

          return newMessages;
        });
      });
    } catch (error: unknown) {
      if (!(error instanceof Error) || error.name !== 'AbortError') {
        console.error('Error:', error);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    isClient && (
      <div className="flex flex-col h-screen">
        {/* 顶部导航栏 - 与浏览器同宽 */}
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between h-14 px-4 w-full">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1 className="text-lg font-bold text-gradient from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">智能对话助手</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <a 
                href="https://cqaibase.cn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                首页
              </a>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="h-full w-full px-4">
            <WelcomeMessage show={showKeywords} t={t} />
            
            <div className="h-[calc(100vh-13rem)] md:h-[calc(100vh-14rem)] overflow-hidden max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                <div 
                  ref={messageRef} 
                  className="h-full px-2 py-4 overflow-y-auto scrollbar-hidden"
                >
                  <MessageList messages={messages} isSearching={isSearching} t={t} />
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {showKeywords && (
          <div className="w-full px-4 mt-2">
            <div className="max-w-4xl mx-auto mb-4">
              <div className="flex flex-col space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">热门问题</h3>
                <div className="flex flex-wrap gap-2">
                  {getDisplayButtons().map((button, index) => (
                    <motion.button
                      key={button.text}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => handleKeywordClick(button.query)}
                      className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 transition-all duration-200 bg-gray-50 dark:bg-gray-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                    >
                      <span className="mr-1.5 font-medium text-blue-500">{index + 1}</span>
                      {button.text.length > 15 ? button.text.substring(0, 15) + '...' : button.text}
                    </motion.button>
                  ))}
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  您可以尝试询问：如何学习编程？如何提高英语口语？如何制作一份简历？
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll to bottom button */}
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto pb-2">
            <ScrollToBottomButton 
              isVisible={showScrollButton} 
              onClick={scrollToBottom} 
            />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="w-full border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex flex-col">
              <div className="relative flex items-end">
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={handleTextareaChange}
                  placeholder={t('Type a message...')}
                  disabled={isLoading}
                  className={`w-full bg-transparent text-gray-800 dark:text-gray-100 pr-12 pl-3 py-3 focus:outline-none resize-none min-h-[48px] max-h-[200px] placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-gray-200 dark:border-gray-700 rounded-lg text-sm ${
                    isLoading ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  onCompositionStart={(e) => {
                    (e.target as HTMLTextAreaElement).dataset.composing = 'true';
                  }}
                  onCompositionEnd={(e) => {
                    (e.target as HTMLTextAreaElement).dataset.composing = 'false';
                  }}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    const isComposing = target.dataset.composing === 'true';
                    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type={isStreaming ? 'button' : 'submit'}
                  onClick={isStreaming ? handleStopResponse : undefined}
                  disabled={
                    (isLoading && !isStreaming) ||
                    (!userInput.trim() && !isStreaming)
                  }
                  className={`absolute right-2 bottom-2 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                    (isLoading && !isStreaming) ||
                    (!userInput.trim() && !isStreaming)
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : isStreaming
                      ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                      : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                  }`}
                >
                  {isStreaming ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14m-4 4l4-4-4-4"
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="flex flex-wrap items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="pl-2 pr-6 py-1 bg-transparent border-none focus:outline-none appearance-none cursor-pointer"
                      disabled={isLoading}
                    >
                      {MODEL_OPTIONS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {t(model.name)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="mx-1">|</span>
                  <button
                    type="button"
                    onClick={() => setUseNetwork(!useNetwork)}
                    className="flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                    {useNetwork ? t('Network: On') : t('Network: Off')}
                  </button>
                </div>
                <div className="text-xs">
                  Shift + Enter 换行
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
