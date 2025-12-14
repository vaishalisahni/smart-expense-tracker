// import React, { useState } from 'react';
// import { AuthProvider } from './context/AuthContext';
// import { useAuth } from './context/AuthContext';
// import Login from './components/Auth/Login';
// import Register from './components/Auth/Register';
// import Dashboard from './components/Dashboard/DashboardHome';

// const App = () => {
//   const [authView, setAuthView] = useState('login');
  
//   return (
//     <AuthProvider>
//       <AuthContent authView={authView} setAuthView={setAuthView} />
//     </AuthProvider>
//   );
// };

// const AuthContent = ({ authView, setAuthView }) => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return authView === 'login' ? (
//       <Login onSwitchToRegister={() => setAuthView('register')} />
//     ) : (
//       <Register onSwitchToLogin={() => setAuthView('login')} />
//     );
//   }

//   return <Dashboard />;
// };

// export default App;

import React, { useState, useEffect, createContext, useContext } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, Users, Download, LogOut, DollarSign, AlertTriangle, Trash2, Wallet, CreditCard, PieChart as PieIcon, Calendar } from 'lucide-react';

// ==================== API & AUTH ====================
const API_URL = 'http://localhost:5000/api';
const api = {
  request: async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }), ...options.headers }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  get: (e) => api.request(e, { method: 'GET' }),
  post: (e, b) => api.request(e, { method: 'POST', body: JSON.stringify(b) }),
  delete: (e) => api.request(e, { method: 'DELETE' })
};

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) try { setUser(JSON.parse(saved)); } catch (e) { localStorage.clear(); }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const d = await api.post('/auth/login', { email, password });
    setUser(d.user);
    localStorage.setItem('token', d.token);
    localStorage.setItem('user', JSON.stringify(d.user));
  };

  const register = async (name, email, password) => {
    const d = await api.post('/auth/register', { name, email, password });
    setUser(d.user);
    localStorage.setItem('token', d.token);
    localStorage.setItem('user', JSON.stringify(d.user));
  };

  const logout = () => { setUser(null); localStorage.clear(); };
  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
};

// ==================== LOGIN ====================
const Login = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); } catch (err) { setError(err.message || 'Login failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to manage your finances</p>
        </div>
        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6"><p className="font-medium">{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none" placeholder="Enter password" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="mt-8 text-center"><p className="text-gray-600">Don't have an account? <button onClick={onSwitch} className="text-indigo-600 font-bold hover:underline">Create Account</button></p></div>
      </div>
    </div>
  );
};

// ==================== REGISTER ====================
const Register = ({ onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try { await register(name, email, password); } catch (err) { setError(err.message || 'Registration failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Get Started</h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6"><p className="font-medium">{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none" placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none" placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition outline-none" placeholder="Min 6 characters" required minLength={6} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <div className="mt-8 text-center"><p className="text-gray-600">Already have account? <button onClick={onSwitch} className="text-indigo-600 font-bold hover:underline">Sign In</button></p></div>
      </div>
    </div>
  );
};

// ==================== ADD EXPENSE MODAL ====================
const AddExpenseModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ description: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const cats = [
    { v: 'food', l: 'Food', i: '🍔' }, { v: 'travel', l: 'Travel', i: '🚗' }, { v: 'education', l: 'Education', i: '📚' },
    { v: 'entertainment', l: 'Fun', i: '🎬' }, { v: 'utilities', l: 'Bills', i: '💡' }, { v: 'shopping', l: 'Shopping', i: '🛍️' },
    { v: 'health', l: 'Health', i: '⚕️' }, { v: 'others', l: 'Others', i: '📦' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await onAdd(form); } catch (err) { alert('Failed: ' + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Add Expense</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition outline-none" placeholder="e.g., Lunch" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition outline-none" placeholder="150" min="0" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {cats.map(c => <button key={c.v} type="button" onClick={() => setForm({ ...form, category: c.v })} className={`p-3 rounded-xl border-2 transition ${form.category === c.v ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}><span className="text-xl mr-2">{c.i}</span><span className="text-sm font-medium">{c.l}</span></button>)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition outline-none" required />
          </div>
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50">{loading ? 'Adding...' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== DASHBOARD ====================
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [budget] = useState(5000);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, anaData] = await Promise.all([api.get('/expenses'), api.get('/expenses/analytics')]);
      setExpenses(expData.data || []);
      setAnalytics(anaData.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const addExpense = async (data) => {
    const res = await api.post('/expenses', data);
    setExpenses([res.data, ...expenses]);
    await loadData();
    setShowAdd(false);
  };

  const deleteExpense = async (id) => {
    if (!confirm('Delete expense?')) return;
    try { await api.delete(`/expenses/${id}`); setExpenses(expenses.filter(e => e._id !== id)); await loadData(); }
    catch (err) { alert('Failed to delete'); }
  };

  const totalSpent = analytics?.totalSpent || 0;
  const pct = (totalSpent / budget) * 100;
  const catData = analytics?.categoryBreakdown?.map(c => ({ name: c._id, value: c.total })) || [];
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600 font-semibold">Loading...</p></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg"><DollarSign className="w-7 h-7 text-white" /></div>
            <div><h1 className="text-2xl font-bold">Expense Tracker</h1><p className="text-xs text-gray-500">AI-Powered Finance</p></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right"><p className="text-xs text-gray-500">Welcome,</p><p className="font-semibold">{user.name}</p></div>
            <button onClick={logout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-8 flex space-x-2">
          {[{ k: 'dashboard', i: Wallet }, { k: 'expenses', i: CreditCard }, { k: 'analytics', i: PieIcon }, { k: 'groups', i: Users }].map(t =>
            <button key={t.k} onClick={() => setView(t.k)} className={`flex items-center space-x-2 flex-1 py-3 px-4 rounded-xl font-semibold transition capitalize ${view === t.k ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}><t.i className="w-5 h-5" /><span>{t.k}</span></button>
          )}
        </div>

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className={`bg-gradient-to-r ${pct >= 100 ? 'from-red-500 to-pink-600' : pct >= 70 ? 'from-yellow-500 to-orange-500' : 'from-green-500 to-emerald-600'} text-white p-8 rounded-2xl shadow-xl`}>
              <div className="flex justify-between mb-6"><div><p className="text-white/80 text-lg mb-2">Monthly Budget</p><h2 className="text-5xl font-bold">₹{(budget - totalSpent).toLocaleString()}</h2><p className="text-white/90 mt-2">of ₹{budget.toLocaleString()}</p></div><AlertTriangle className="w-12 h-12 opacity-80" /></div>
              <div className="bg-white/20 rounded-full h-4 mb-3"><div className="bg-white rounded-full h-4" style={{ width: `${Math.min(pct, 100)}%` }}></div></div>
              <p className="text-lg font-semibold">{pct >= 100 ? '⚠️ Budget Exceeded!' : pct >= 70 ? '⚠️ High Spending' : '✅ On Track'}</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm"><p className="text-gray-500 font-medium mb-2">Total Spent</p><p className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm"><p className="text-gray-500 font-medium mb-2">Transactions</p><p className="text-3xl font-bold">{expenses.length}</p></div>
              <div className="bg-white p-6 rounded-2xl shadow-sm"><p className="text-gray-500 font-medium mb-2">Daily Avg</p><p className="text-3xl font-bold">₹{Math.round(totalSpent / 30)}</p></div>
            </div>

            {expenses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><DollarSign className="w-12 h-12 text-gray-400" /></div>
                <h3 className="text-2xl font-bold mb-3">No Expenses Yet</h3>
                <p className="text-gray-500 mb-6">Start tracking by adding your first expense</p>
                <button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg">Add First Expense</button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Recent Expenses</h3>
                  <button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Add</span></button>
                </div>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map(ex => (
                    <div key={ex._id} className="flex justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                      <div><p className="font-semibold">{ex.description}</p><div className="flex items-center space-x-3 mt-1"><span className="text-sm text-gray-500">{new Date(ex.date).toLocaleDateString()}</span><span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">{ex.category}</span></div></div>
                      <p className="text-2xl font-bold">₹{ex.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'expenses' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Expenses</h2>
              <button onClick={() => setShowAdd(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Add New</span></button>
            </div>
            {expenses.length === 0 ? <div className="text-center py-16"><p className="text-gray-500 text-lg">No expenses</p></div> : (
              <div className="space-y-3">
                {expenses.map(ex => (
                  <div key={ex._id} className="flex justify-between p-5 bg-gray-50 rounded-xl hover:shadow-md border border-gray-100">
                    <div><p className="font-bold text-lg">{ex.description}</p><div className="flex items-center space-x-3 mt-2"><span className="text-sm text-gray-600">{new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">{ex.category}</span></div></div>
                    <div className="flex items-center space-x-4"><p className="text-2xl font-bold">₹{ex.amount}</p><button onClick={() => deleteExpense(ex._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 className="w-5 h-5" /></button></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'analytics' && (
          <div className="space-y-6">
            {catData.length > 0 ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h3 className="text-2xl font-bold mb-6">Spending by Category</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart><Pie data={catData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={120} dataKey="value">{catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v) => `₹${v}`} /></PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h3 className="text-2xl font-bold mb-6">Category Breakdown</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={catData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(v) => `₹${v}`} /><Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><TrendingUp className="w-12 h-12 text-gray-400" /></div>
                <h3 className="text-2xl font-bold mb-3">No Data</h3>
                <p className="text-gray-500">Add expenses to see analytics</p>
              </div>
            )}
          </div>
        )}

        {view === 'groups' && (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"><Users className="w-12 h-12 text-indigo-600" /></div>
            <h3 className="text-2xl font-bold mb-3">Groups Coming Soon</h3>
            <p className="text-gray-500 max-w-md mx-auto">Create expense groups and split bills. Coming soon!</p>
          </div>
        )}
      </div>

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onAdd={addExpense} />}
    </div>
  );
};
export default function App() {
  const [authView, setAuthView] = useState('login');
  return (
    <AuthProvider>
      <AppContent authView={authView} setAuthView={setAuthView} />
    </AuthProvider>
  );
}

const AppContent = ({ authView, setAuthView }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user) return authView === 'login' ? <Login onSwitch={() => setAuthView('register')} /> : <Register onSwitch={() => setAuthView('login')} />;
  return <Dashboard />;
};