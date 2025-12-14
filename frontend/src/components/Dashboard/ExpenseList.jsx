import React from 'react';
import { Plus } from 'lucide-react';

const ExpenseList = ({ expenses, setExpenses, onAddExpense }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">All Expenses</h2>
        <button onClick={onAddExpense} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {expenses.map(expense => (
        <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-900">{expense.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600">{expense.date}</span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">{expense.category}</span>
              {expense.aiGenerated && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">AI</span>
              )}
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">₹{expense.amount}</p>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
