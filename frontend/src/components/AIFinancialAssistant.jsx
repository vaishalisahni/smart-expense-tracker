import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, TrendingUp, DollarSign, AlertCircle, Minimize2 } from 'lucide-react';

const AIFinancialAssistant = ({ expenses = [], budget = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there 👋 I'm your AI financial assistant powered by Grok. How can I help with your finances today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const quickActions = [
    { icon: TrendingUp, text: 'Analyze spending', prompt: 'Analyze my spending patterns and provide insights' },
    { icon: DollarSign, text: 'Budget advice', prompt: 'Give me personalized budget advice based on my expenses' },
    { icon: Sparkles, text: 'Savings tips', prompt: 'How can I save more money this month?' }
  ];

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    // Check if user has expenses (except for greetings)
    const isGreeting = /^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)/i.test(messageText.trim());
    if (expenses.length === 0 && !isGreeting) {
      const noExpenseMessage = {
        role: 'assistant',
        content: "I notice you don't have any expenses yet. Start adding expenses to get personalized financial advice! In the meantime, I can answer general finance questions. 💡",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, noExpenseMessage]);
      setInputMessage('');
      return;
    }

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryBreakdown = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

      const financialContext = {
        totalSpent,
        budget,
        remaining: budget - totalSpent,
        expenseCount: expenses.length,
        categories: categoryBreakdown,
        averageDaily: expenses.length > 0 ? totalSpent / 30 : 0,
        percentageUsed: budget > 0 ? (totalSpent / budget * 100).toFixed(1) : 0
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: messageText,
            context: financialContext,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again. If the problem persists, check your internet connection.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt) => {
    sendMessage(prompt);
  };

  const handleSendClick = () => {
    if (inputMessage.trim() && !loading) {
      sendMessage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      {/* Floating Button - Enhanced */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 z-50 group"
          aria-label="Open AI assistant"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse">
            AI
          </div>
        </button>
      )}

      {/* Chat Window - Enhanced Mobile Responsive */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-200 transition-all duration-300 ${
          isMinimized 
            ? 'w-80 h-14' 
            : 'w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-2rem)] sm:h-[600px] max-h-[90vh]'
        }`}>
          {/* Header - Responsive */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-3 sm:p-4 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base lg:text-lg truncate">AI Financial Assistant</h3>
                {!isMinimized && (
                  <p className="text-[10px] sm:text-xs opacity-90 truncate">Powered by Grok</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition"
                aria-label="Close chat"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Container - Responsive */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-2.5 sm:p-3 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 rounded-2xl p-2.5 sm:p-3 border border-gray-200 flex items-center space-x-2 shadow-sm">
                      <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-indigo-600" />
                      <span className="text-xs sm:text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions - Responsive */}
              {messages.length <= 1 && !loading && (
                <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-2 font-medium">Quick actions:</p>
                  <div className="space-y-1.5 sm:space-y-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="w-full flex items-center space-x-2 p-2 sm:p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 transition-all text-left group"
                      >
                        <action.icon className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">{action.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area - Responsive */}
              <div className="p-3 sm:p-4 border-t border-gray-200 bg-white rounded-b-2xl sm:rounded-b-3xl flex-shrink-0">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your financial question..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm transition-all"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendClick}
                    disabled={loading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 sm:p-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 group"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
                <div className="flex items-start space-x-1 mt-2">
                  <AlertCircle className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-500">
                    AI can make mistakes. Verify important information.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 640px) {
          .max-h-[90vh] {
            max-height: calc(100vh - 2rem);
          }
        }
      `}</style>
    </>
  );
};

export default AIFinancialAssistant;