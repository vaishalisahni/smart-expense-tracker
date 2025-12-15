import React, { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, Download, LogOut, DollarSign, AlertTriangle, CheckCircle, Settings, Menu, X, PieChart, BarChart3, Users, Sparkles } from 'lucide-react';
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
    const [error, setError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user?.monthlyBudget) {
            setBudget(user.monthlyBudget);
        }
    }, [user]);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await expenseService.getExpenses();
            setExpenses(response.data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setError('Failed to load expenses. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const totalSpent = useMemo(() =>
        expenses.reduce((sum, exp) => sum + exp.amount, 0),
        [expenses]
    );

    const budgetStatus = useMemo(() =>
        predictBudgetRisk(expenses, budget),
        [expenses, budget]
    );

    const aiInsights = useMemo(() =>
        expenses.length > 0 ? generateAIInsights(expenses) : [],
        [expenses]
    );

    const handleAddExpense = async (expenseData) => {
        try {
            const response = await expenseService.createExpense(expenseData);
            setExpenses([response.data, ...expenses]);
            setShowAddExpense(false);
        } catch (error) {
            console.error('Error adding expense:', error);
            alert(error.response?.data?.error || 'Failed to add expense. Please try again.');
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/expenses/export?format=csv`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export expenses');
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
        { id: 'expenses', label: 'Expenses', icon: DollarSign },
        { id: 'analytics', label: 'Analytics', icon: PieChart },
        { id: 'groups', label: 'Groups', icon: Users }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="h-8 bg-gray-200 rounded-full w-48 sm:w-64 animate-pulse"></div>
                    </div>
                </nav>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Enhanced Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                                    Smart Expense
                                </h1>
                                <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Finance Manager</p>
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-3">
                            <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                                <p className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
                                    👋 {user.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowProfileSettings(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="font-medium">Settings</span>
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 shadow-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition ml-2"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden mt-4 pb-2 border-t pt-4 space-y-2 animate-fadeIn">
                            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                                <p className="text-sm font-semibold text-gray-700">👋 Hello, {user.name}!</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowProfileSettings(true);
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="font-medium">Settings</span>
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center space-x-2 px-4 py-3 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm animate-shake">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Enhanced Tab Navigation */}
                <div className="flex space-x-2 mb-6 bg-white p-2 rounded-2xl shadow-sm overflow-x-auto scrollbar-hide border border-gray-100">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                                    view === item.id
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Dashboard View */}
                {view === 'dashboard' && (
                    <div className="space-y-6">
                        {expenses.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <DollarSign className="w-10 h-10 text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Journey</h3>
                                <p className="text-gray-600 mb-6">Track your first expense and let AI help you manage your finances</p>
                                <button
                                    onClick={() => setShowAddExpense(true)}
                                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Your First Expense</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Budget Status Card */}
                                <div className={`rounded-3xl shadow-lg p-6 text-white relative overflow-hidden ${
                                    budgetStatus.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                    budgetStatus.color === 'yellow' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                    budgetStatus.color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                                    'bg-gradient-to-br from-red-500 to-red-600'
                                }`}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <p className="text-white/80 text-sm font-medium mb-1">Monthly Budget</p>
                                                <h2 className="text-4xl font-bold mb-1">₹{(budget - totalSpent).toLocaleString()}</h2>
                                                <p className="text-white/80 text-sm">Remaining of ₹{budget.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="bg-white/20 rounded-full h-3 mb-3 overflow-hidden backdrop-blur-sm">
                                            <div 
                                                className="bg-white rounded-full h-3 transition-all duration-500" 
                                                style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm font-semibold">{budgetStatus.message}</p>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-red-600" />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 mt-1">This month</p>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-gray-600 text-sm font-medium">Transactions</p>
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">{expenses.length}</p>
                                        <p className="text-xs text-gray-500 mt-1">Total count</p>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-gray-600 text-sm font-medium">Daily Average</p>
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-green-600" />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">₹{(totalSpent / 30).toFixed(0)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Per day</p>
                                    </div>
                                </div>

                                {/* AI Insights */}
                                {aiInsights.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {aiInsights.map((insight, idx) => (
                                                <div key={idx} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                                    <CheckCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-gray-700 font-medium">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setShowAddExpense(true)}
                                        className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3"
                                    >
                                        <Plus className="w-6 h-6" />
                                        <span className="text-lg font-bold">Add Expense</span>
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="p-6 bg-white border-2 border-indigo-200 text-indigo-600 rounded-2xl shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center space-x-3"
                                    >
                                        <Download className="w-6 h-6" />
                                        <span className="text-lg font-bold">Export Report</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {view === 'expenses' && <ExpenseList expenses={expenses} setExpenses={setExpenses} onAddExpense={() => setShowAddExpense(true)} />}
                {view === 'analytics' && <Analytics expenses={expenses} />}
                {view === 'groups' && <GroupManager groups={groups} setGroups={setGroups} />}
            </div>

            {showAddExpense && (
                <AddExpense
                    onClose={() => setShowAddExpense(false)}
                    onAddExpense={handleAddExpense}
                />
            )}

            {showProfileSettings && (
                <ProfileSettings onClose={() => setShowProfileSettings(false)} />
            )}

            <AIFinancialAssistant expenses={expenses} budget={budget} />

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;