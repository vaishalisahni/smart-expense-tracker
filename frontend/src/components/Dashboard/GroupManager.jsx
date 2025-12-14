import React from 'react';
import { Plus, Users } from 'lucide-react';

const GroupManager = ({ groups, setGroups }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Expense Groups</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      {groups.map(group => (
        <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
              <p className="text-gray-600 mt-1">{group.members} members</p>
            </div>
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">Total Group Expense</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{group.totalExpense}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupManager;