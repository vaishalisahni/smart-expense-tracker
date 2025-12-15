import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle, FileImage, Sparkles, Loader, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const ReceiptScanner = ({ onClose, onExpenseData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setExtractedData(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const processReceipt = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const response = await api.post('/expenses/ocr-process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setExtractedData(response.data.receiptData);
      } else {
        setError(response.data.error || 'Failed to process receipt');
      }
    } catch (err) {
      console.error('Error processing receipt:', err);
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

  const resetScanner = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedData(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-2xl my-4 sm:my-8 shadow-2xl border border-gray-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Receipt Scanner</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mb-4 flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {!preview ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <FileImage className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Upload Receipt Image
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Supports: JPG, PNG, WebP (Max 10MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg font-semibold text-sm sm:text-base group"
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Upload Image</span>
              </button>
              <button
                onClick={() => {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current?.click();
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-semibold text-sm sm:text-base group"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                <span>Take Photo</span>
              </button>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                📸 Tips for best results:
              </h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• Ensure good lighting and clear image</li>
                <li>• Keep receipt flat and straight</li>
                <li>• Include all text in the frame</li>
                <li>• Avoid shadows and glare</li>
                <li>• Make sure text is readable</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Image Preview */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full max-h-72 sm:max-h-96 object-contain"
              />
            </div>

            {/* Extracted Data Display */}
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

                  <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Merchant</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {extractedData.merchantName || 'Unknown'}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Date</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      {extractedData.date ? new Date(extractedData.date).toLocaleDateString() : 'Today'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Description</p>
                  <p className="text-xs sm:text-sm text-gray-900">
                    {extractedData.description || 'No description'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={resetScanner}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{extractedData ? 'Scan Another' : 'Cancel'}</span>
              </button>

              {!extractedData ? (
                <button
                  onClick={processReceipt}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 font-semibold text-sm sm:text-base shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Scan Receipt</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold text-sm sm:text-base shadow-lg"
                >
                  Add Expense
                </button>
              )}
            </div>

            {/* Processing Status */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent flex-shrink-0"></div>
                <p className="text-xs sm:text-sm text-blue-800">
                  Analyzing receipt with AI... This may take a few seconds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Info */}
        <div className="mt-4 sm:mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              <strong>🤖 AI-Powered OCR:</strong> Uses advanced optical character recognition to extract text from receipts. 
              Accuracy may vary based on image quality. Please verify extracted data before confirming.
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

export default ReceiptScanner;