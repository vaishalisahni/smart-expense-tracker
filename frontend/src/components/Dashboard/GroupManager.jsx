import React, { useState } from 'react';
import { Plus, Users, TrendingUp, UserPlus, Settings, Trash2, DollarSign, Calendar, AlertCircle } from 'lucide-react';

const GroupManager = ({ groups, setGroups }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) {
      setError('Group name is required');
      return;
    }

    const group = {
      id: Date.now(),
      name: newGroup.name,
      description: newGroup.description,
      members: 1,
      totalExpense: 0,
      createdAt: new Date().toISOString()
    };

    setGroups([...groups, group]);
    setNewGroup({ name: '', description: '' });
    setShowCreateModal(false);
    setError('');
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Expense Groups
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Manage shared expenses with friends</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:shadow-xl transition-all flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg text-center border border-gray-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Groups Yet</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Create your first group to start managing shared expenses</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Create Group</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {groups.map(group => (
            <div 
              key={group.id} 
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{group.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <UserPlus className="w-3 h-3" />
                      {group.members} {group.members === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 flex-shrink-0">
                  <button 
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100"
                    aria-label="Group settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    aria-label="Delete group"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {group.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                    Total Expense
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">₹{group.totalExpense.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Coming Soon Notice */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1 text-sm sm:text-base">🚀 Coming Soon</h4>
            <p className="text-xs sm:text-sm text-amber-800">
              Full group expense management features including member invitations, expense splitting, and detailed analytics are under development. Stay tuned!
            </p>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-gray-100 animate-scaleIn">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Create New Group</h3>
              </div>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                  setNewGroup({ name: '', description: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Close"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 text-xs sm:text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
                  placeholder="e.g., Weekend Trip, Roommates"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-sm sm:text-base"
                  rows="3"
                  placeholder="What's this group for?"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setNewGroup({ name: '', description: '' });
                  }}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition text-sm sm:text-base"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default GroupManager;