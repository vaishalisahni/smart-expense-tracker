import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const InitialSetup = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    currency: 'INR',
    savingsGoal: '',
    goalAmount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      const response = await fetch('http://localhost:5000/api/auth/profile', {
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

      // ✅ Refresh user data and navigate
      await refreshUser();
      navigate('/dashboard', { replace: true });

    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ setupCompleted: true })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Unable to skip setup. Try again.');
      }

      // ✅ Refresh user data and navigate
      await refreshUser();
      navigate('/dashboard', { replace: true });
      
    } catch (err) {
      setError(err.message || 'Unable to skip setup. Try again.');
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Monthly Income</h2>
              <p className="text-gray-600 mt-2">How much do you earn per month?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  {currencies.find(c => c.code === formData.currency)?.symbol}
                </span>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="10000"
                  min="0"
                  step="100"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This helps us calculate your recommended budget
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Recommended Allocation</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• 80% for expenses: {formData.monthlyIncome ? `₹${(parseFloat(formData.monthlyIncome) * 0.8).toFixed(0)}` : '₹0'}</p>
                <p>• 20% for savings: {formData.monthlyIncome ? `₹${(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}` : '₹0'}</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Currency</h2>
              <p className="text-gray-600 mt-2">Select your preferred currency</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => setFormData({ ...formData, currency: currency.code })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.currency === currency.code
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">{currency.symbol}</div>
                  <div className="font-semibold text-gray-900">{currency.code}</div>
                  <div className="text-xs text-gray-600">{currency.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Set Your Saving Goal</h2>
              <p className="text-gray-600 mt-2">What are you saving for?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Savings Goal
              </label>
              <input
                type="text"
                value={formData.savingsGoal}
                onChange={(e) => setFormData({ ...formData, savingsGoal: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Emergency Fund"
              />
              <p className="mt-2 text-sm text-gray-500">
                Give your goal a name (e.g., Laptop, Vacation, Emergency Fund)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  {currencies.find(c => c.code === formData.currency)?.symbol}
                </span>
                <input
                  type="number"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="5000"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {formData.monthlyIncome && formData.goalAmount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">📊 Goal Timeline</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• Monthly savings: {currencies.find(c => c.code === formData.currency)?.symbol}{(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}</p>
                  <p>• Time to reach goal: {Math.ceil(parseFloat(formData.goalAmount) / (parseFloat(formData.monthlyIncome) * 0.2))} months</p>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">All Set!</h2>
              <p className="text-gray-600 mt-2">Review your settings</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Monthly Income</div>
                <div className="text-2xl font-bold text-gray-900">
                  {currencies.find(c => c.code === formData.currency)?.symbol}{formData.monthlyIncome}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Currency</div>
                <div className="text-xl font-bold text-gray-900">{formData.currency}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Savings Goal</div>
                <div className="text-xl font-bold text-gray-900">{formData.savingsGoal}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-1">Goal Amount</div>
                <div className="text-2xl font-bold text-gray-900">
                  {currencies.find(c => c.code === formData.currency)?.symbol}{formData.goalAmount}
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">Your Budget Plan</h4>
                <div className="text-sm text-indigo-800 space-y-1">
                  <p>• Monthly Budget: {currencies.find(c => c.code === formData.currency)?.symbol}{(parseFloat(formData.monthlyIncome) * 0.8).toFixed(0)}</p>
                  <p>• Weekly Budget: {currencies.find(c => c.code === formData.currency)?.symbol}{(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}</p>
                  <p>• Monthly Savings: {currencies.find(c => c.code === formData.currency)?.symbol}{(parseFloat(formData.monthlyIncome) * 0.2).toFixed(0)}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-sm font-medium text-indigo-600">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          )}
        </div>

        {step === 1 && (
          <button
            onClick={handleSkip}
            disabled={loading}
            className="w-full mt-4 text-gray-600 text-sm hover:text-gray-900 transition disabled:opacity-50"
          >
            Skip setup for now
          </button>
        )}
      </div>
    </div>
  );
};

export default InitialSetup;