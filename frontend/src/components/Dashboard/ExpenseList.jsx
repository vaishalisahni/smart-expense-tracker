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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Expenses</h2>
        <button 
          onClick={onAddExpense} 
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm text-center">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">No expenses to display</p>
          <button 
            onClick={onAddExpense} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
          >
            Add Your First Expense
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(expense => (
            <div key={expense._id} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 break-words text-sm sm:text-base">{expense.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString('en-IN')}
                    </span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize whitespace-nowrap">
                      {expense.category}
                    </span>
                    {expense.aiGenerated && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">
                        AI {expense.aiConfidence ? `(${Math.round(expense.aiConfidence * 100)}%)` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-4">
                  <p className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">₹{expense.amount}</p>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                    title="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;