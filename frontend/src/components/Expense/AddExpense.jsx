import React, { useState } from 'react';
import { Mic, Camera } from 'lucide-react';
import { aiCategorizeExpense } from '../../utils/aiCategorization';

const AddExpense = ({ onClose, onAddExpense }) => {
  const [newExpense, setNewExpense] = useState({ 
    amount: '', 
    description: '', 
    category: 'food', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [voiceInput, setVoiceInput] = useState(false);

  const handleAddExpense = () => {
    if (newExpense.amount && newExpense.description) {
      const aiResult = aiCategorizeExpense(newExpense.description, parseFloat(newExpense.amount));
      const expense = {
        id: Date.now(),
        amount: parseFloat(newExpense.amount),
        category: aiResult.category,
        description: newExpense.description,
        date: newExpense.date,
        aiGenerated: aiResult.aiGenerated
      };
      onAddExpense(expense);
    }
  };

  const handleVoiceInput = () => {
    setVoiceInput(true);
    setTimeout(() => {
      setNewExpense({ ...newExpense, description: 'Dinner at restaurant', amount: '250' });
      setVoiceInput(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Expense</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Lunch at cafeteria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleVoiceInput} className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition">
              <Mic className="w-4 h-4" />
              <span>{voiceInput ? 'Listening...' : 'Voice Input'}</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
              <Camera className="w-4 h-4" />
              <span>Scan Receipt</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleAddExpense} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
