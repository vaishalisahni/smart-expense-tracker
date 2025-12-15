import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, Download, LogOut, DollarSign, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { expenseService } from '../../services/expenseService';
import { predictBudgetRisk, generateAIInsights } from '../../utils/aiCategorization';
import ExpenseList from './ExpenseList';
import Analytics from './Analytics';
import GroupManager from './GroupManager';
import AddExpense from '../Expense/AddExpense';
import ProfileSettings from '../Profile/ProfileSettings';
import AIFinancialAssistant from '../AIFinancialAssistant';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState('dashboard');
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [budget, setBudget] = useState(user?.monthlyBudget || 5000);
    const [groups, setGroups] = useState([]);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);

    // Fetch expenses from backend
    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const response = await expenseService.getExpenses();
            setExpenses(response.data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetStatus = predictBudgetRisk(expenses, budget);
    const aiInsights = expenses.length > 0 ? generateAIInsights(expenses) : [];

    const handleAddExpense = async (expenseData) => {
        try {
            const response = await expenseService.createExpense(expenseData);
            setExpenses([response.data, ...expenses]);
            setShowAddExpense(false);
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your expenses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Smart Expense Tracker</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">Hello, {user.name}</span>
                        <button
                            onClick={() => setShowProfileSettings(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                        >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Tab Navigation */}
                <div className="flex space-x-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
                    <button onClick={() => setView('dashboard')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Dashboard
                    </button>
                    <button onClick={() => setView('expenses')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${view === 'expenses' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Expenses
                    </button>
                    <button onClick={() => setView('analytics')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${view === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Analytics
                    </button>
                    <button onClick={() => setView('groups')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${view === 'groups' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Groups
                    </button>
                </div>

                {/* Dashboard View */}
                {view === 'dashboard' && (
                    <div className="space-y-6">
                        {expenses.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Expenses Yet</h3>
                                <p className="text-gray-600 mb-6">Start tracking your expenses by adding your first transaction</p>
                                <button
                                    onClick={() => setShowAddExpense(true)}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-flex items-center space-x-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Your First Expense</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Budget Status Card */}
                                <div className={`bg-gradient-to-r ${budgetStatus.color === 'green' ? 'from-green-500 to-green-600' : budgetStatus.color === 'yellow' ? 'from-yellow-500 to-yellow-600' : budgetStatus.color === 'orange' ? 'from-orange-500 to-orange-600' : 'from-red-500 to-red-600'} text-white p-6 rounded-xl shadow-lg`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-lg font-medium opacity-90">Monthly Budget</h2>
                                            <p className="text-3xl font-bold mt-2">₹{budget - totalSpent}</p>
                                            <p className="text-sm opacity-90 mt-1">Remaining of ₹{budget}</p>
                                        </div>
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-full h-3 mb-2">
                                        <div className="bg-white rounded-full h-3" style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}></div>
                                    </div>
                                    <p className="text-sm font-medium">{budgetStatus.message}</p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <p className="text-gray-600 text-sm">Total Spent</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalSpent}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <p className="text-gray-600 text-sm">Transactions</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{expenses.length}</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <p className="text-gray-600 text-sm">Avg. Daily</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">₹{(totalSpent / 30).toFixed(0)}</p>
                                    </div>
                                </div>

                                {/* AI Insights */}
                                {aiInsights.length > 0 && (
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                                            <h3 className="text-lg font-bold text-gray-900">AI-Powered Insights</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {aiInsights.map((insight, idx) => (
                                                <div key={idx} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
                                                    <p className="text-gray-700">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setShowAddExpense(true)} className="bg-indigo-600 text-white p-4 rounded-xl shadow-sm hover:bg-indigo-700 transition flex items-center justify-center space-x-2">
                                        <Plus className="w-5 h-5" />
                                        <span className="font-semibold">Add Expense</span>
                                    </button>
                                    <button className="bg-white border-2 border-indigo-600 text-indigo-600 p-4 rounded-xl shadow-sm hover:bg-indigo-50 transition flex items-center justify-center space-x-2">
                                        <Download className="w-5 h-5" />
                                        <span className="font-semibold">Export Report</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Other Views */}
                {view === 'expenses' && <ExpenseList expenses={expenses} setExpenses={setExpenses} onAddExpense={() => setShowAddExpense(true)} />}
                {view === 'analytics' && <Analytics expenses={expenses} />}
                {view === 'groups' && <GroupManager groups={groups} setGroups={setGroups} />}
            </div>

            {/* Add Expense Modal */}
            {showAddExpense && (
                <AddExpense
                    onClose={() => setShowAddExpense(false)}
                    onAddExpense={handleAddExpense}
                />
            )}
            {/* Profile Settings Modal */}
            {showProfileSettings && (
                <ProfileSettings onClose={() => setShowProfileSettings(false)} />
            )}
            {/* AI Chatbot - Floating Button */}
            <AIFinancialAssistant 
                expenses={expenses} 
                budget={budget} 
            />
        </div>
    );
};

export default Dashboard;