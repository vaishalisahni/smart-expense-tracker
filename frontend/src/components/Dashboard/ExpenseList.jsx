import React, { useState } from 'react';
import { Plus, Trash2, Search, Filter, Calendar, Tag } from 'lucide-react';
import { expenseService } from '../../services/expenseService';

const ExpenseList = ({ expenses, setExpenses, onAddExpense }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');

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
      food: 'bg-orange-100 text-orange-700 border-orange-200',
      travel: 'bg-blue-100 text-blue-700 border-blue-200',
      education: 'bg-purple-100 text-purple-700 border-purple-200',
      entertainment: 'bg-pink-100 text-pink-700 border-pink-200',
      utilities: 'bg-green-100 text-green-700 border-green-200',
      shopping: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      health: 'bg-red-100 text-red-700 border-red-200',
      others: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || colors.others;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            All Expenses
          </h2>
          <p className="text-gray-600 text-sm mt-1">{filteredExpenses.length} transactions found</p>
        </div>
        <button 
          onClick={onAddExpense} 
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add New</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterCategory !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Start tracking by adding your first expense'}
          </p>
          {!searchQuery && filterCategory === 'all' && (
            <button 
              onClick={onAddExpense} 
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map(expense => (
            <div 
              key={expense._id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Left Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl ${getCategoryColor(expense.category).split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                      <Tag className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 break-words">
                        {expense.description}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(expense.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(expense.category)}`}>
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </span>
                        {expense.aiGenerated && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 text-xs rounded-full font-semibold">
                            🤖 AI {expense.aiConfidence ? `${Math.round(expense.aiConfidence * 100)}%` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:scale-110 border-2 border-transparent hover:border-red-200"
                    title="Delete expense"
                  >
                    <Trash2 className="w-5 h-5" />
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