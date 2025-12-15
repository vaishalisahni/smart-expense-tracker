import React, { useState } from 'react';
import { Mic, Camera, X, DollarSign, FileText, Tag, Calendar, Sparkles } from 'lucide-react';
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
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await onAddExpense({
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: formData.category,
                date: formData.date
            });
        } catch (error) {
            console.error('Error adding expense:', error);
        } finally {
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-2xl my-8 shadow-2xl border border-gray-100 transform animate-scaleIn">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-t-3xl"></div>
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Add New Expense</h3>
                            <p className="text-indigo-100 text-sm">Track your spending with AI assistance</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* AI Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setShowVoiceInput(true)}
                            className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Mic className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">Voice Input</p>
                                <p className="text-xs text-green-600">Speak your expense</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowReceiptScanner(true)}
                            className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 text-blue-700 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">Scan Receipt</p>
                                <p className="text-xs text-blue-600">Upload or capture</p>
                            </div>
                        </button>
                    </div>

                    {/* Manual Entry */}
                    <div className="pt-4 border-t-2 border-gray-100">
                        <p className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                            <span>Or enter manually</span>
                        </p>

                        <div className="space-y-5">
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Description *
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium"
                                    placeholder="e.g., Lunch at cafeteria"
                                    required
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-2" />
                                    Amount (₹) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-2xl font-bold"
                                        placeholder="150"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    <Tag className="w-4 h-4 inline mr-2" />
                                    Category
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.value })}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                                                formData.category === cat.value
                                                    ? `bg-gradient-to-br ${cat.color} text-white border-transparent shadow-lg scale-105`
                                                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="text-2xl mb-2">{cat.icon}</div>
                                            <p className={`text-sm font-bold ${formData.category === cat.value ? 'text-white' : 'text-gray-900'}`}>
                                                {cat.label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                {formData.category === 'auto' && (
                                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-purple-800">
                                            <strong>AI Auto-detect:</strong> Our AI will automatically categorize this expense based on the description.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default AddExpense;