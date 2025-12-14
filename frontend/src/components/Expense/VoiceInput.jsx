import React, { useState, useRef } from 'react';
import { Mic, StopCircle, X, AlertCircle, CheckCircle } from 'lucide-react';

const VoiceInput = ({ onClose, onExpenseData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:5000/api/expenses/voice', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setTranscript(data.transcript || 'Audio processed successfully');
        setExtractedData(data.data);
      } else {
        setError(data.error || 'Failed to process audio');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error processing audio:', err);
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Recording Interface */}
        <div className="flex flex-col items-center space-y-6">
          {/* Microphone Button */}
          <div className="relative">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
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

          {/* Status Text */}
          <div className="text-center">
            {isRecording && (
              <p className="text-lg font-medium text-red-600 animate-pulse">
                Recording... Speak now!
              </p>
            )}
            {loading && (
              <p className="text-lg font-medium text-indigo-600">
                Processing audio...
              </p>
            )}
            {!isRecording && !loading && !transcript && (
              <p className="text-gray-600">
                Click the microphone to start recording
              </p>
            )}
          </div>

          {/* Instructions */}
          {!isRecording && !loading && !transcript && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
              <h4 className="font-semibold text-blue-900 mb-2">📝 How to use:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Say: "Spent 150 rupees on lunch"</li>
                <li>• Say: "Paid 500 for textbooks"</li>
                <li>• Say: "50 rupees for bus ticket"</li>
              </ul>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="w-full space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">📝 Transcript:</p>
                <p className="text-gray-900">{transcript}</p>
              </div>

              {extractedData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-900">Extracted Data:</p>
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

        {/* Browser Compatibility Note */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> Voice input requires microphone access. Works best in Chrome, Edge, or Firefox.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;