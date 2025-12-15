import React, { useState } from 'react';
import { Mic, Camera, X, DollarSign, FileText, Tag, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import VoiceInput from './VoiceInput';
import ReceiptScanner from './ReceiptScanner';

const AddExpense = ({ onClose, onAddExpense }) => {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: 'auto',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showVoiceInput, setShowVoiceInput] = useState(false);
    const [showReceiptScanner, setShowReceiptScanner] = useState(false);

    const categories = [
        { value: 'auto', label: 'Auto-detect (AI)', icon: '🤖', color: 'from-purple-500 to-pink-500' },
        { value: 'food', label: 'Food & Dining', icon: '🍕', color: 'from-orange-500 to-red-500' },
        { value: 'travel', label: 'Travel', icon: '🚗', color: 'from-blue-500 to-cyan-500' },
        { value: 'education', label: 'Education', icon: '📚', color: 'from-indigo-500 to-purple-500' },
        { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'from-pink-500 to-rose-500' },
        { value: 'utilities', label: 'Utilities', icon: '⚡', color: 'from-green-500 to-emerald-500' },
        { value: 'shopping', label: 'Shopping', icon: '🛍️', color: 'from-yellow-500 to-orange-500' },
        { value: 'health', label: 'Health', icon: '💊', color: 'from-red-500 to-pink-500' },
        { value: 'others', label: 'Others', icon: '📦', color: 'from-gray-500 to-slate-500' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.amount || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            setError('Amount must be greater than 0');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            await onAddExpense({
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: formData.category,
                date: formData.date
            });
        } catch (error) {
            console.error('Error adding expense:', error);
            setError('Failed to add expense. Please try again.');
            setLoading(false);
        }
    };

    const handleVoiceData = (expenseData) => {
        setFormData({
            amount: expenseData.amount?.toString() || '',
            description: expenseData.description || '',
            category: expenseData.category || 'auto',
            date: expenseData.date || new Date().toISOString().split('T')[0]
        });
        setShowVoiceInput(false);
    };

    const handleReceiptData = (expenseData) => {
        setFormData({
            amount: expenseData.amount?.toString() || '',
            description: expenseData.description || '',
            category: expenseData.category || 'auto',
            date: expenseData.date || new Date().toISOString().split('T')[0]
        });
        setShowReceiptScanner(false);
    };

    const selectedCategory = categories.find(cat => cat.value === formData.category);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl my-4 sm:my-8 shadow-2xl border border-gray-100 transform animate-scaleIn max-h-[95vh] overflow-y-auto">
                {/* Header - Responsive */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl sticky top-0 z-10">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-t-2xl sm:rounded-t-3xl"></div>
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Add New Expense</h3>
                            <p className="text-indigo-100 text-xs sm:text-sm">Track your spending with AI assistance</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-xl flex items-start space-x-2 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* AI Quick Actions - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => setShowVoiceInput(true)}
                            className="flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
                        >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm sm:text-base">Voice Input</p>
                                <p className="text-xs text-green-600">Speak your expense</p>
                            </div>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setShowReceiptScanner(true)}
                            className="flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-700 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 group"
                        >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm sm:text-base">Scan Receipt</p>
                                <p className="text-xs text-blue-600">Upload or capture</p>
                            </div>
                        </button>
                    </div>

                    {/* Manual Entry Section */}
                    <div className="pt-3 sm:pt-4 border-t-2 border-gray-100">
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-3 sm:mb-4 flex items-center gap-2">
                            <span>Or enter manually</span>
                        </p>

                        <div className="space-y-4 sm:space-y-5">
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-2" />
                                    Description *
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium text-sm sm:text-base"
                                    placeholder="e.g., Lunch at cafeteria"
                                    required
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-2" />
                                    Amount (₹) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-xl sm:text-2xl font-bold"
                                        placeholder="150"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category - Responsive Grid */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-2" />
                                    Category
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-80 overflow-y-auto pr-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.value })}
                                            className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                                formData.category === cat.value
                                                    ? `bg-gradient-to-br ${cat.color} text-white border-transparent shadow-lg scale-105`
                                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{cat.icon}</div>
                                            <p className={`text-xs sm:text-sm font-bold ${formData.category === cat.value ? 'text-white' : 'text-gray-900'}`}>
                                                {cat.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                {formData.category === 'auto' && (
                                    <div className="mt-3 p-2.5 sm:p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
                                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-purple-800">
                                            <strong>AI Auto-detect:</strong> Our AI will automatically categorize this expense based on the description.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-2" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-5 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding...
                                </span>
                            ) : (
                                'Add Expense'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {showVoiceInput && (
                <VoiceInput
                    onClose={() => setShowVoiceInput(false)}
                    onExpenseData={handleVoiceData}
                />
            )}

            {showReceiptScanner && (
                <ReceiptScanner
                    onClose={() => setShowReceiptScanner(false)}
                    onExpenseData={handleReceiptData}
                />
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
            `}</style>
        </div>
    );
};

export default AddExpense;