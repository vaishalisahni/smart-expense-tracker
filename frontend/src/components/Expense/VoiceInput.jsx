import React, { useState, useRef } from 'react';
import { Mic, StopCircle, X, AlertCircle, CheckCircle } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Voice Input</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSpeechSupported() && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading || !isSpeechSupported()}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <StopCircle className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></div>
            )}
          </div>

          <div className="text-center">
            {isRecording && (
              <p className="text-lg font-medium text-red-600 animate-pulse">
                Listening... Speak now!
              </p>
            )}
            {loading && (
              <p className="text-lg font-medium text-indigo-600">
                Processing speech...
              </p>
            )}
            {!isRecording && !loading && !transcript && (
              <p className="text-gray-600">
                Click the microphone to start
              </p>
            )}
          </div>

          {!isRecording && !loading && !transcript && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
              <h4 className="font-semibold text-blue-900 mb-2">💬 Example phrases:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• "Spent 150 rupees on lunch"</li>
                <li>• "Paid 500 for textbooks"</li>
                <li>• "50 rupees bus ticket"</li>
                <li>• "Dinner at restaurant for 300"</li>
              </ul>
            </div>
          )}

          {transcript && (
            <div className="w-full space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">📝 You said:</p>
                <p className="text-gray-900 italic">"{transcript}"</p>
              </div>

              {extractedData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900">Extracted:</p>
                  </div>
                  <div className="space-y-1 text-sm text-green-800">
                    <p><strong>Amount:</strong> ₹{extractedData.amount}</p>
                    <p><strong>Description:</strong> {extractedData.description}</p>
                    <p><strong>Category:</strong> {extractedData.category}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setTranscript('');
                    setExtractedData(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Try Again
                </button>
                {extractedData && (
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Add Expense
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>💡 Tip:</strong> Speak clearly and include the amount, what you bought, and optionally where you bought it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;