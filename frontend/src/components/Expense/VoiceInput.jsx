import React, { useState, useRef } from 'react';
import { Mic, StopCircle, X, AlertCircle, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const VoiceInput = ({ onClose, onExpenseData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const recognitionRef = useRef(null);

  const isSpeechSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  const startRecording = () => {
    if (!isSpeechSupported()) {
      setError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setError('');
        setTranscript('');
        setExtractedData(null);
      };

      recognition.onresult = async (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        setIsRecording(false);
        await processTranscript(speechResult);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access.');
        } else {
          setError(`Error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const processTranscript = async (text) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/expenses/voice-process', { 
        transcript: text 
      });

      if (response.data.success) {
        setExtractedData(response.data.expenseData);
      } else {
        setError(response.data.error || 'Failed to process voice input');
      }
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onExpenseData(extractedData);
      onClose();
    }
  };

  const handleRetry = () => {
    setTranscript('');
    setExtractedData(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-gray-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Voice Input</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Support Check */}
        {!isSpeechSupported() && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm">
              Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {/* Recording Button */}
          <div className="relative">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading || !isSpeechSupported()}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all transform ${
                isRecording
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 animate-pulse'
                  : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-110'
              } disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl`}
            >
              {isRecording ? (
                <StopCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              ) : (
                <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              )}
            </button>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            {isRecording && (
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-bold text-red-600 animate-pulse">
                  🎤 Listening... Speak now!
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Tap the button to stop recording
                </p>
              </div>
            )}
            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-base sm:text-lg font-medium text-indigo-600">
                    Processing speech...
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Our AI is analyzing your input
                </p>
              </div>
            )}
            {!isRecording && !loading && !transcript && (
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-gray-600">
                  Click the microphone to start
                </p>
                <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                  <Sparkles className="w-3 h-3" />
                  <span>AI-powered voice recognition</span>
                </div>
              </div>
            )}
          </div>

          {/* Instructions (when idle) */}
          {!isRecording && !loading && !transcript && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3 sm:p-4 w-full">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                💬 Example phrases:
              </h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• "Spent 150 rupees on lunch"</li>
                <li>• "Paid 500 for textbooks"</li>
                <li>• "50 rupees bus ticket"</li>
                <li>• "Dinner at restaurant for 300"</li>
              </ul>
            </div>
          )}

          {/* Transcript and Extracted Data */}
          {transcript && (
            <div className="w-full space-y-3 sm:space-y-4">
              {/* Transcript Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  📝 You said:
                </p>
                <p className="text-gray-900 italic text-sm sm:text-base">"{transcript}"</p>
              </div>

              {/* Extracted Data */}
              {extractedData && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900 text-sm sm:text-base">Extracted Information:</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Amount</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        ₹{extractedData.amount || 'Not found'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Category</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900 capitalize">
                        {extractedData.category || 'others'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">
                      {extractedData.description || 'No description'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{extractedData ? 'Try Again' : 'Retry'}</span>
                </button>

                {extractedData && (
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold text-sm sm:text-base shadow-lg"
                  >
                    Add Expense
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pro Tip */}
        <div className="mt-4 sm:mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>💡 Pro Tip:</strong> Speak clearly and include the amount, what you bought, and optionally where you bought it for best results.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default VoiceInput;