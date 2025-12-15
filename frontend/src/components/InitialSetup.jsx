import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, TrendingUp, CheckCircle, Globe, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InitialSetup = () => {
  const navigate = useNavigate();
  const { refreshUser, updateUser } = useAuth();

  const [step, setStep] = useState(() => {
    return Number(sessionStorage.getItem('setupStep')) || 1;
  });

  const [formData, setFormData] = useState({
    monthlyIncome: '',
    currency: 'INR',
    savingsGoal: '',
    goalAmount: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    sessionStorage.setItem('setupStep', step);
  }, [step]);

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  const handleSubmit = async () => {
    if (!formData.monthlyIncome || !formData.savingsGoal || !formData.goalAmount) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const monthlyBudget = parseFloat(formData.monthlyIncome) * 0.8;
      const weeklyBudget = monthlyBudget / 4;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          monthlyBudget,
          weeklyBudget,
          preferences: {
            currency: formData.currency
          },
          setupCompleted: true
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save setup');
      }

      updateUser({ setupCompleted: true });
      sessionStorage.removeItem('setupStep');
      navigate('/dashboard', { replace: true });
      refreshUser();

    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ setupCompleted: true })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Unable to skip setup. Try again.');
      }

      updateUser({ setupCompleted: true });
      sessionStorage.removeItem('setupStep');
      navigate('/dashboard', { replace: true });
      refreshUser();

    } catch (err) {
      setError(err.message || 'Unable to skip setup. Try again.');
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (password.length < 6) return { level: 0, text: 'Too short', color: 'red' };
    if (password.length < 8) return { level: 1, text: 'Weak', color: 'orange' };
    if (password.length < 10 && /[A-Z]/.test(password)) return { level: 2, text: 'Good', color: 'yellow' };
    if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 3, text: 'Strong', color: 'green' };
    return { level: 1, text: 'Weak', color: 'orange' };
  };

  const renderStep = () => {
    const selectedCurrency = currencies.find(c => c.code === formData.currency);

    switch (step) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Monthly Income</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">How much do you earn per month?</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Income
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg sm:text-xl">
                  {selectedCurrency?.symbol}
                </span>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="10000"
                  min="0"
                  step="100"
                />
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                This helps us calculate your recommended budget
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">💡 Recommended Allocation</h4>
              <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                <p>• 80% for expenses: {formData.monthlyIncome ? `${selectedCurrency?.symbol}${(parseFloat(formData.monthlyIncome) * 0.8).toFixed(0)}` : `${selectedCurrency?.symbol}0`}</p>
                <p>• 20% for savings: {formData.monthlyIncome ? `${selectedCurrency?.symbol}${(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}` : `${selectedCurrency?.symbol}0`}</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Currency</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Select your preferred currency</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => setFormData({ ...formData, currency: currency.code })}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                    formData.currency === currency.code
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105'
                      : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl sm:text-3xl mb-2">{currency.symbol}</div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">{currency.code}</div>
                  <div className="text-xs text-gray-600">{currency.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                <Target className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Set Your Saving Goal</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">What are you saving for?</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Savings Goal
              </label>
              <input
                type="text"
                value={formData.savingsGoal}
                onChange={(e) => setFormData({ ...formData, savingsGoal: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm sm:text-base"
                placeholder="e.g. Emergency Fund, Laptop, Vacation"
              />
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Give your goal a name
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Goal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg sm:text-xl">
                  {selectedCurrency?.symbol}
                </span>
                <input
                  type="number"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="5000"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {formData.monthlyIncome && formData.goalAmount && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">📊 Goal Timeline</h4>
                <div className="text-xs sm:text-sm text-green-800 space-y-1">
                  <p>• Monthly savings: {selectedCurrency?.symbol}{(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}</p>
                  <p>• Time to reach goal: {Math.ceil(parseFloat(formData.goalAmount) / (parseFloat(formData.monthlyIncome) * 0.2))} months</p>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Set!</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Review your settings</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Monthly Income</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedCurrency?.symbol}{formData.monthlyIncome}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Currency</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">{formData.currency}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Savings Goal</div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">{formData.savingsGoal}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Goal Amount</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedCurrency?.symbol}{formData.goalAmount}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-indigo-900 mb-2 text-sm sm:text-base">Your Budget Plan</h4>
                <div className="text-xs sm:text-sm text-indigo-800 space-y-1">
                  <p>• Monthly Budget: {selectedCurrency?.symbol}{(parseFloat(formData.monthlyIncome) * 0.8).toFixed(0)}</p>
                  <p>• Weekly Budget: {selectedCurrency?.symbol}{(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}</p>
                  <p>• Monthly Savings: {selectedCurrency?.symbol}{(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-xs sm:text-sm font-medium text-indigo-600">
              {Math.round((step / 4) * 100)}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm animate-shake">
            {error}
          </div>
        )}

        {renderStep()}

        <div className="flex gap-2.5 sm:gap-3 mt-6 sm:mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 text-sm sm:text-base"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          )}
        </div>

        {step === 1 && (
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full mt-3 sm:mt-4 text-gray-600 text-xs sm:text-sm hover:text-gray-900 transition disabled:opacity-50"
          >
            Skip setup for now
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default InitialSetup;