import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle, FileImage, Sparkles, Loader, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const ReceiptScanner = ({ onClose, onExpenseData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [imageType, setImageType] = useState('auto'); // auto, receipt, sms
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
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

      const response = await api.post(
        `/expenses/ocr-process?type=${imageType}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.success) {
        setExtractedData(response.data.receiptData);
        console.log('Extracted:', response.data);
      } else {
        setError(response.data.error || 'Failed to process image');
      }
    } catch (err) {
      console.error('Error processing receipt:', err);
      setError(err.response?.data?.error || 'Failed to process image. Please try again.');
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📸 Scan Receipt/SMS</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {!preview ? (
          <div className="space-y-4">
            {/* Image Type Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Image Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setImageType('auto')}
                  className={`p-3 rounded-xl border-2 transition ${
                    imageType === 'auto'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-xs font-medium">Auto Detect</div>
                </button>
                <button
                  onClick={() => setImageType('receipt')}
                  className={`p-3 rounded-xl border-2 transition ${
                    imageType === 'receipt'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">🧾</div>
                  <div className="text-xs font-medium">Receipt</div>
                </button>
                <button
                  onClick={() => setImageType('sms')}
                  className={`p-3 rounded-xl border-2 transition ${
                    imageType === 'sms'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">💬</div>
                  <div className="text-xs font-medium">SMS/UPI</div>
                </button>
              </div>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <FileImage className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload Image</p>
              <p className="text-sm text-gray-600 mb-4">Click or drag to upload</p>
              <p className="text-xs text-gray-500">Supports: JPG, PNG (Max 10MB)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                <Upload className="w-5 h-5" />
                Upload
              </button>
              <button
                onClick={() => {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current?.click();
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
              >
                <Camera className="w-5 h-5" />
                Camera
              </button>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📸 Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Keep image clear and readable</li>
                <li>• Works with: Receipts, SMS, Bank notifications, UPI screenshots</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-96 object-contain bg-gray-50"
              />
            </div>

            {/* Extracted Data */}
            {extractedData && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-900">Extracted Data:</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Amount</p>
                    <p className="text-lg font-bold">₹{extractedData.amount || '---'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Category</p>
                    <p className="text-sm font-medium capitalize">{extractedData.category || 'others'}</p>
                  </div>
                  {extractedData.merchantName && (
                    <div className="bg-white rounded-lg p-3 border border-green-200 col-span-2">
                      <p className="text-xs text-gray-600 mb-1">Merchant</p>
                      <p className="text-sm font-medium">{extractedData.merchantName}</p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 border border-green-200 col-span-2">
                    <p className="text-xs text-gray-600 mb-1">Description</p>
                    <p className="text-sm">{extractedData.description || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetScanner}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-semibold"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                {extractedData ? 'Scan Another' : 'Cancel'}
              </button>

              {!extractedData ? (
                <button
                  onClick={processReceipt}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 inline animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 inline mr-2" />
                      Scan Now
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold"
                >
                  Add Expense
                </button>
              )}
            </div>

            {/* Processing Status */}
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <Loader className="w-5 h-5 animate-spin text-blue-600" />
                <p className="text-sm text-blue-800">
                  Processing with AI OCR... This may take 10-30 seconds.
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