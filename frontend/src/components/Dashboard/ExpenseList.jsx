import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { expenseService } from '../../services/expenseService';

const ExpenseList = ({ expenses, setExpenses, onAddExpense }) => {
  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await expenseService.deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp._id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">All Expenses</h2>
        <button onClick={onAddExpense} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <p className="text-gray-600 mb-4">No expenses to display</p>
          <button onClick={onAddExpense} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            Add Your First Expense
          </button>
        </div>
      ) : (
        expenses.map(expense => (
          <div key={expense._id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{expense.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString('en-IN')}
                </span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">
                  {expense.category}
                </span>
                {expense.aiGenerated && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    AI {expense.aiConfidence ? `(${Math.round(expense.aiConfidence * 100)}%)` : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-xl font-bold text-gray-900">₹{expense.amount}</p>
              <button
                onClick={() => handleDelete(expense._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExpenseList;