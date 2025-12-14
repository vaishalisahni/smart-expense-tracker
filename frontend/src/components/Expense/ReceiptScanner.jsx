import React, { useState, useRef } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle, FileImage } from 'lucide-react';

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
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

      const response = await fetch('http://localhost:5000/api/expenses/ocr', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setExtractedData(data.data);
      } else {
        setError(data.error || 'Failed to process receipt');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error processing receipt:', err);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Receipt Scanner</h3>
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

        {/* Upload Interface */}
        {!preview && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition"
            >
              <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Upload Receipt Image
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Supports: JPG, PNG (Max 5MB)
              </p>
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
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Image</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📸 Tips for best results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure good lighting</li>
                <li>• Keep receipt flat and straight</li>
                <li>• Include all text in the image</li>
                <li>• Avoid shadows and glare</li>
              </ul>
            </div>
          </div>
        )}

        {/* Preview & Processing */}
        {preview && (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full max-h-96 object-contain bg-gray-100"
              />
            </div>

            {/* Extracted Data */}
            {extractedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-900">Extracted Information:</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{extractedData.amount || 'Not found'}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Category</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {extractedData.category || 'others'}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Merchant</p>
                    <p className="text-sm font-medium text-gray-900">
                      {extractedData.receiptData?.merchantName || 'Unknown'}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {extractedData.date ? new Date(extractedData.date).toLocaleDateString() : 'Today'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Description</p>
                  <p className="text-sm text-gray-900">
                    {extractedData.description || 'No description'}
                  </p>
                </div>

                {extractedData.receiptData?.ocrConfidence && (
                  <div className="flex items-center space-x-2 text-xs text-green-700">
                    <div className="flex-1 bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${extractedData.receiptData.ocrConfidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">
                      {Math.round(extractedData.receiptData.ocrConfidence * 100)}% confidence
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={resetScanner}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                {extractedData ? 'Scan Another' : 'Cancel'}
              </button>

              {!extractedData ? (
                <button
                  onClick={processReceipt}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Scan Receipt'}
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Expense
                </button>
              )}
            </div>

            {/* Processing Status */}
            {loading && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-indigo-800">
                  Analyzing receipt with AI... This may take a few seconds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Technology Note */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>🤖 AI-Powered:</strong> Uses OCR technology to extract text from receipts. 
            Accuracy may vary based on image quality. Please verify extracted data before confirming.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;