import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

const AIFinancialAssistant = ({ expenses = [], budget = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there 👋 I'm your AI financial assistant. How can I help with your finances today? 😊",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: TrendingUp, text: 'Analyze my spending', prompt: 'Analyze my spending patterns' },
    { icon: DollarSign, text: 'Budget advice', prompt: 'Give me budget advice' },
    { icon: Sparkles, text: 'Savings tips', prompt: 'How can I save more money?' }
  ];

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() && !inputMessage.trim()) return;

    // ✅ FIXED: Check if user has expenses
    if (expenses.length === 0 && !messageText.toLowerCase().includes('hello') && !messageText.toLowerCase().includes('hi')) {
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
      content: messageText || inputMessage,
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
        averageDaily: expenses.length > 0 ? totalSpent / 30 : 0
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            message: messageText || inputMessage,
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
      {/* ✅ FIXED: Floating button with better positioning */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-110 z-50"
          aria-label="Open AI assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            AI
          </div>
        </button>
      )}

      {/* ✅ FIXED: Chat window with mobile responsiveness */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 sm:w-96 mx-4 sm:mx-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Financial Assistant</h3>
                <p className="text-xs opacity-90">Powered by Grok</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                      }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 rounded-2xl p-3 border border-gray-200 flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (only show at start) */}
          {messages.length <= 1 && !loading && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="w-full flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition text-left text-sm"
                  >
                    <action.icon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="text-gray-700">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your financial question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSendClick}
                disabled={loading || !inputMessage.trim()}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIFinancialAssistant;