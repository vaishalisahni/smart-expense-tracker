import React, { useState } from 'react';
import { Plus, Trash2, Search, Filter, Calendar, Tag, TrendingDown, AlertCircle } from 'lucide-react';
import { expenseService } from '../../services/expenseService';

const ExpenseList = ({ expenses, setExpenses, onAddExpense }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    setDeleteLoading(expenseId);
    try {
      await expenseService.deleteExpense(expenseId);
      setExpenses(expenses.filter(exp => exp._id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredExpenses = expenses
    .filter(exp => {
      const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'amount') return b.amount - a.amount;
      return 0;
    });

  const categories = ['all', ...new Set(expenses.map(exp => exp.category))];

  const getCategoryColor = (category) => {
    const colors = {
      food: 'bg-orange-100 text-orange-700 border-orange-300',
      travel: 'bg-blue-100 text-blue-700 border-blue-300',
      education: 'bg-purple-100 text-purple-700 border-purple-300',
      entertainment: 'bg-pink-100 text-pink-700 border-pink-300',
      utilities: 'bg-green-100 text-green-700 border-green-300',
      shopping: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      health: 'bg-red-100 text-red-700 border-red-300',
      others: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[category] || colors.others;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍕',
      travel: '🚗',
      education: '📚',
      entertainment: '🎬',
      utilities: '⚡',
      shopping: '🛍️',
      health: '💊',
      others: '📦'
    };
    return icons[category] || icons.others;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            All Expenses
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'} found
          </p>
        </div>
        <button 
          onClick={onAddExpense} 
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add New</span>
        </button>
      </div>

      {/* Filters - Enhanced Responsive */}
      <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer text-sm sm:text-base"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : `${getCategoryIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer text-sm sm:text-base"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List - Enhanced Responsive */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            {searchQuery || filterCategory !== 'all' ? (
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            ) : (
              <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No expenses found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {searchQuery || filterCategory !== 'all' 
              ? 'Try adjusting your filters to see more results' 
              : 'Start tracking by adding your first expense'}
          </p>
          {!searchQuery && filterCategory === 'all' && (
            <button 
              onClick={onAddExpense} 
              className="inline-flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredExpenses.map(expense => (
            <div 
              key={expense._id} 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-5 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Left Section - Responsive */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${getCategoryColor(expense.category).split(' ')[0]} flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl`}>
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-1 break-words line-clamp-2">
                        {expense.description}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(expense.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${getCategoryColor(expense.category)}`}>
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </span>
                        {expense.aiGenerated && (
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 text-[10px] sm:text-xs rounded-full font-semibold">
                            🤖 AI {expense.aiConfidence ? `${Math.round(expense.aiConfidence * 100)}%` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Responsive */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 sm:flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    disabled={deleteLoading === expense._id}
                    className="p-2 sm:p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 border-2 border-transparent hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete expense"
                  >
                    {deleteLoading === expense._id ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer - Responsive */}
      {filteredExpenses.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg p-4 sm:p-6 border border-indigo-100">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ₹{filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Average</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ₹{Math.round(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0) / filteredExpenses.length).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;