import React, { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, Users, Download, LogOut, DollarSign, AlertTriangle, CheckCircle, Settings, Menu, X } from 'lucide-react';
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
            const response = await fetch('http://localhost:5000/api/expenses/export?format=csv', {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="h-8 bg-gray-200 rounded w-48 sm:w-64 animate-pulse"></div>
                    </div>
                </nav>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation - Mobile Responsive */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0" />
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                                <span className="hidden sm:inline">Smart Expense Tracker</span>
                                <span className="sm:hidden">Expense Tracker</span>
                            </h1>
                        </div>
                        
                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center space-x-4">
                            <span className="text-gray-700 truncate max-w-[200px]">Hello, {user.name}</span>
                            <button
                                onClick={() => setShowProfileSettings(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition whitespace-nowrap"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition whitespace-nowrap"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition ml-2"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden mt-4 pb-2 border-t pt-4 space-y-2">
                            <div className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg">
                                Hello, {user.name}
                            </div>
                            <button
                                onClick={() => {
                                    setShowProfileSettings(true);
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Tab Navigation - Mobile Responsive */}
                <div className="flex space-x-1 sm:space-x-2 mb-4 sm:mb-6 bg-white p-1.5 sm:p-2 rounded-lg shadow-sm overflow-x-auto scrollbar-hide">
                    <button 
                        onClick={() => setView('dashboard')} 
                        className={`flex-1 min-w-[80px] sm:min-w-[100px] py-2 px-2 sm:px-4 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Dashboard
                    </button>
                    <button 
                        onClick={() => setView('expenses')} 
                        className={`flex-1 min-w-[80px] sm:min-w-[100px] py-2 px-2 sm:px-4 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap ${view === 'expenses' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Expenses
                    </button>
                    <button 
                        onClick={() => setView('analytics')} 
                        className={`flex-1 min-w-[80px] sm:min-w-[100px] py-2 px-2 sm:px-4 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap ${view === 'analytics' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Analytics
                    </button>
                    <button 
                        onClick={() => setView('groups')} 
                        className={`flex-1 min-w-[80px] sm:min-w-[100px] py-2 px-2 sm:px-4 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap ${view === 'groups' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Groups
                    </button>
                </div>

                {/* Dashboard View */}
                {view === 'dashboard' && (
                    <div className="space-y-4 sm:space-y-6">
                        {expenses.length === 0 ? (
                            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-sm text-center">
                                <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Expenses Yet</h3>
                                <p className="text-sm sm:text-base text-gray-600 mb-6">Start tracking your expenses by adding your first transaction</p>
                                <button
                                    onClick={() => setShowAddExpense(true)}
                                    className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition inline-flex items-center space-x-2 text-sm sm:text-base"
                                >
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Add Your First Expense</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Budget Status Card - Mobile Responsive */}
                                <div className={`bg-gradient-to-r ${budgetStatus.color === 'green' ? 'from-green-500 to-green-600' : budgetStatus.color === 'yellow' ? 'from-yellow-500 to-yellow-600' : budgetStatus.color === 'orange' ? 'from-orange-500 to-orange-600' : 'from-red-500 to-red-600'} text-white p-4 sm:p-6 rounded-xl shadow-lg`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-base sm:text-lg font-medium opacity-90">Monthly Budget</h2>
                                            <p className="text-2xl sm:text-3xl font-bold mt-2 break-words">₹{budget - totalSpent}</p>
                                            <p className="text-xs sm:text-sm opacity-90 mt-1">Remaining of ₹{budget}</p>
                                        </div>
                                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ml-2" />
                                    </div>
                                    <div className="bg-white bg-opacity-20 rounded-full h-2 sm:h-3 mb-2">
                                        <div className="bg-white rounded-full h-2 sm:h-3 transition-all duration-300" style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}></div>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium">{budgetStatus.message}</p>
                                </div>

                                {/* Stats Grid - Mobile Responsive */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                                        <p className="text-gray-600 text-xs sm:text-sm">Total Spent</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 break-words">₹{totalSpent}</p>
                                    </div>
                                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                                        <p className="text-gray-600 text-xs sm:text-sm">Transactions</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{expenses.length}</p>
                                    </div>
                                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                                        <p className="text-gray-600 text-xs sm:text-sm">Avg. Daily</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2 break-words">₹{(totalSpent / 30).toFixed(0)}</p>
                                    </div>
                                </div>

                                {/* AI Insights - Mobile Responsive */}
                                {aiInsights.length > 0 && (
                                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                                        <div className="flex items-center space-x-2 mb-4">
                                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900">AI-Powered Insights</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {aiInsights.map((insight, idx) => (
                                                <div key={idx} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                                    <p className="text-sm sm:text-base text-gray-700 break-words">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions - Mobile Responsive */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <button 
                                        onClick={() => setShowAddExpense(true)} 
                                        className="bg-indigo-600 text-white p-3 sm:p-4 rounded-xl shadow-sm hover:bg-indigo-700 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
                                    >
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="font-semibold">Add Expense</span>
                                    </button>
                                    <button 
                                        onClick={handleExport} 
                                        className="bg-white border-2 border-indigo-600 text-indigo-600 p-3 sm:p-4 rounded-xl shadow-sm hover:bg-indigo-50 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
                                    >
                                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="font-semibold">Export Report</span>
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

            <AIFinancialAssistant 
                expenses={expenses} 
                budget={budget} 
            />

            <style jsx>{`
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