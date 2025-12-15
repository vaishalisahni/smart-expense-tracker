import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const Analytics = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm text-center">
        <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-sm sm:text-base text-gray-600">Add some expenses to see analytics and insights</p>
      </div>
    );
  }

  const categoryData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Custom label for mobile
  const renderLabel = (entry) => {
    if (window.innerWidth < 640) {
      return `${entry.name.substring(0, 3)}`;
    }
    return `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              data={categoryData} 
              cx="50%" 
              cy="50%" 
              labelLine={false}
              label={renderLabel}
              outerRadius={window.innerWidth < 640 ? 60 : 80}
              fill="#8884d8" 
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="min-w-[300px]">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                angle={window.innerWidth < 640 ? -45 : 0}
                textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                height={window.innerWidth < 640 ? 60 : 30}
              />
              <YAxis tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '12px' : '14px' }} />
              <Bar dataKey="value" fill="#4F46E5" name="Amount (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;