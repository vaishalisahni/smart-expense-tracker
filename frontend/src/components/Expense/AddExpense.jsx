import React, { useState } from 'react';
import { Mic, Camera, X } from 'lucide-react';
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

    const handleVoiceInput = () => {
        setShowVoiceInput(true);
    };

    const handleReceiptScan = () => {
        setShowReceiptScanner(true);
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md my-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add New Expense</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                            placeholder="e.g., Lunch at cafeteria"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                            placeholder="150"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        >
                            <option value="auto">Auto-detect (AI)</option>
                            <option value="food">Food</option>
                            <option value="travel">Travel</option>
                            <option value="education">Education</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="utilities">Utilities</option>
                            <option value="shopping">Shopping</option>
                            <option value="health">Health</option>
                            <option value="others">Others</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
                        >
                            <Mic className="w-4 h-4" />
                            <span>Voice Input</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleReceiptScan}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                            <Camera className="w-4 h-4" />
                            <span>Scan Receipt</span>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm sm:text-base"
                        >
                            {loading ? 'Adding...' : 'Add Expense'}
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
        </div>
    );
};

export default AddExpense;