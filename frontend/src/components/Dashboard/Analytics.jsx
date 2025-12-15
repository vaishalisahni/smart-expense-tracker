import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Calendar, TrendingDown } from 'lucide-react';

const Analytics = ({ expenses }) => {
  const categoryData = useMemo(() => {
    if (expenses.length === 0) return [];
    
    const grouped = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value,
        percentage: 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const dailyData = useMemo(() => {
    if (expenses.length === 0) return [];
    
    const grouped = expenses.reduce((acc, exp) => {
      const date = new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      acc[date] = (acc[date] || 0) + exp.amount;
      return acc;
    }, {});
    
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14); // Last 14 days
  }, [expenses]);

  const topExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const totalSpent = useMemo(() => 
    expenses.reduce((sum, exp) => sum + exp.amount, 0),
    [expenses]
  );

  const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

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
    return icons[category.toLowerCase()] || icons.others;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-6 sm:p-12 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-sm sm:text-base text-gray-600">Add some expenses to see analytics and insights</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-indigo-600 font-bold">₹{payload[0].value.toLocaleString()}</p>
          {payload[0].payload.percentage !== undefined && (
            <p className="text-xs text-gray-600">{payload[0].payload.percentage}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate percentages
  const dataWithPercentages = categoryData.map(item => ({
    ...item,
    percentage: ((item.value / totalSpent) * 100).toFixed(1)
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analytics & Insights
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Detailed breakdown of your expenses</p>
        </div>
        <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-xs sm:text-sm font-semibold text-indigo-600">
            {expenses.length} Transactions
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
          <p className="text-xs sm:text-sm text-white/80 mb-2">Total Spent</p>
          <p className="text-2xl sm:text-3xl font-bold">₹{totalSpent.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
          <p className="text-xs sm:text-sm text-white/80 mb-2">Avg per Day</p>
          <p className="text-2xl sm:text-3xl font-bold">₹{Math.round(totalSpent / 30).toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
          <p className="text-xs sm:text-sm text-white/80 mb-2">Categories</p>
          <p className="text-2xl sm:text-3xl font-bold">{categoryData.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white">
          <p className="text-xs sm:text-sm text-white/80 mb-2">Avg Transaction</p>
          <p className="text-2xl sm:text-3xl font-bold">₹{Math.round(totalSpent / expenses.length).toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <PieIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Category Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={dataWithPercentages} 
                cx="50%" 
                cy="50%" 
                labelLine={false}
                label={({ name, percentage }) => {
                  if (window.innerWidth < 640) {
                    return `${percentage}%`;
                  }
                  return `${name}: ${percentage}%`;
                }}
                outerRadius={window.innerWidth < 640 ? 70 : 90}
                fill="#8884d8" 
                dataKey="value"
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dataWithPercentages.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-gray-700 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Spending by Category</h3>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[300px] px-4 sm:px-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#6b7280' }}
                    angle={window.innerWidth < 640 ? -45 : 0}
                    textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                    height={window.innerWidth < 640 ? 70 : 30}
                  />
                  <YAxis 
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#6b7280' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Trend Line Chart */}
      {dailyData.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Daily Spending Trend</h3>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[300px] px-4 sm:px-0">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: window.innerWidth < 640 ? 9 : 11, fill: '#6b7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fontSize: window.innerWidth < 640 ? 10 : 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Expenses */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Top 5 Expenses</h3>
        <div className="space-y-3">
          {topExpenses.map((expense, index) => (
            <div 
              key={expense._id} 
              className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 border border-gray-200"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{expense.description}</p>
                  <p className="text-xs text-gray-600">
                    {getCategoryIcon(expense.category)} {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                  </p>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className="text-lg sm:text-xl font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-600">
                  {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;