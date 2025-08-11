import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from './components/Card';
import { Button } from './components/Button';

const FinancialProfileDetailed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [financialProfile, setFinancialProfile] = useState({
    // Basic Info
    currentIncome: '',
    incomeType: 'salary', // salary, business, mixed
    employmentStatus: 'employed',
    jobStability: 'stable',
    
    // Debt Information
    totalDebt: '',
    debts: [
      { type: 'student_loan', balance: '', monthlyPayment: '', interestRate: '' },
      { type: 'car_loan', balance: '', monthlyPayment: '', interestRate: '' },
      { type: 'credit_card', balance: '', monthlyPayment: '', interestRate: '' },
      { type: 'personal_loan', balance: '', monthlyPayment: '', interestRate: '' },
      { type: 'mortgage', balance: '', monthlyPayment: '', interestRate: '' }
    ],
    
    // Credit Information
    creditScore: '',
    creditHistory: '',
    
    // Assets
    emergencyFund: '',
    savingsAccount: '',
    checkingAccount: '',
    investments401k: '',
    investmentsIRA: '',
    otherInvestments: '',
    realEstate: '',
    vehicles: '',
    otherAssets: '',
    
    // Down Payment & Home Buying
    availableDownPayment: '',
    targetHomePrice: '',
    desiredLocation: '',
    homeType: 'single_family',
    timeframeForBuying: '',
    
    // Monthly Expenses (Detailed)
    monthlyExpenses: {
      housing: '', // current rent/mortgage
      utilities: '',
      food: '',
      transportation: '',
      insurance: '',
      healthcare: '',
      entertainment: '',
      clothing: '',
      personalCare: '',
      childcare: '',
      education: '',
      subscriptions: '',
      otherExpenses: ''
    },
    
    // Financial Goals
    shortTermGoals: [], // Array of goals with amounts and timeframes
    longTermGoals: [],
    retirementGoals: {
      targetAge: '',
      monthlyIncomeNeeded: '',
      currentRetirementSavings: ''
    },
    
    // Risk Assessment
    riskTolerance: 'moderate',
    investmentExperience: 'beginner',
    financialKnowledge: 'basic',
    
    // Insurance
    lifeInsurance: '',
    disabilityInsurance: '',
    healthInsurance: '',
    propertyInsurance: '',
    
    // Additional Info
    dependents: '',
    maritalStatus: 'single',
    spouseIncome: '',
    largePurchasesPlanned: [],
    unusualFinancialCircumstances: ''
  });

  useEffect(() => {
    loadFinancialProfile();
  }, [user]);

  const loadFinancialProfile = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'detailedFinancialProfiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setFinancialProfile({ ...financialProfile, ...docSnap.data() });
      }
    } catch (error) {
      console.error('Error loading financial profile:', error);
      if (error.code === 'permission-denied') {
        console.warn('Permission denied accessing detailed financial profile. This may be expected for new users or if Firebase security rules need updating.');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFinancialProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFinancialProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDebtChange = (index, field, value) => {
    setFinancialProfile(prev => {
      const newDebts = [...prev.debts];
      newDebts[index] = { ...newDebts[index], [field]: value };
      return { ...prev, debts: newDebts };
    });
  };

  const addGoal = (type) => {
    const newGoal = { description: '', amount: '', timeframe: '', priority: 'medium' };
    setFinancialProfile(prev => ({
      ...prev,
      [type]: [...prev[type], newGoal]
    }));
  };

  const handleGoalChange = (type, index, field, value) => {
    setFinancialProfile(prev => {
      const newGoals = [...prev[type]];
      newGoals[index] = { ...newGoals[index], [field]: value };
      return { ...prev, [type]: newGoals };
    });
  };

  const removeGoal = (type, index) => {
    setFinancialProfile(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'detailedFinancialProfiles', user.uid);
      await setDoc(docRef, {
        ...financialProfile,
        lastUpdated: new Date(),
        userId: user.uid
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving financial profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAndTest = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'detailedFinancialProfiles', user.uid);
      await setDoc(docRef, {
        ...financialProfile,
        lastUpdated: new Date(),
        userId: user.uid
      });
      
      // Navigate to chat advisor
      navigate('/app');
    } catch (error) {
      console.error('Error saving financial profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return value ? `$${parseFloat(value).toLocaleString()}` : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900">Financial Profile</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  // Navigate to dashboard and potentially trigger chat tab
                  navigate('/app');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Try AI Advisor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Financial Profile</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Provide detailed financial information to get personalized and accurate advice from our AI Financial Advisor. 
          This comprehensive profile enables the AI to give you specific recommendations for home buying, investments, and retirement planning.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Financial profile saved successfully!
        </div>
      )}

      {/* Income & Employment */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">💼 Income & Employment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
            <input
              type="number"
              value={financialProfile.currentIncome}
              onChange={(e) => handleInputChange('currentIncome', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$75,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Income Type</label>
            <select
              value={financialProfile.incomeType}
              onChange={(e) => handleInputChange('incomeType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="salary">Salary</option>
              <option value="hourly">Hourly</option>
              <option value="business">Business/Self-employed</option>
              <option value="commission">Commission</option>
              <option value="mixed">Mixed Sources</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status</label>
            <select
              value={financialProfile.employmentStatus}
              onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="employed">Employed Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="self_employed">Self-employed</option>
              <option value="contract">Contract/Freelance</option>
              <option value="unemployed">Unemployed</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Stability</label>
            <select
              value={financialProfile.jobStability}
              onChange={(e) => handleInputChange('jobStability', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="very_stable">Very Stable (5+ years)</option>
              <option value="stable">Stable (2-5 years)</option>
              <option value="moderate">Moderate (1-2 years)</option>
              <option value="unstable">Unstable (&lt;1 year)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Debt Information */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">💳 Debt Information</h2>
        <div className="space-y-4">
          {financialProfile.debts.map((debt, index) => (
            <div key={debt.type} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3 capitalize">
                {debt.type.replace('_', ' ')} Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                  <input
                    type="number"
                    value={debt.balance}
                    onChange={(e) => handleDebtChange(index, 'balance', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
                  <input
                    type="number"
                    value={debt.monthlyPayment}
                    onChange={(e) => handleDebtChange(index, 'monthlyPayment', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="$0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={debt.interestRate}
                    onChange={(e) => handleDebtChange(index, 'interestRate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="5.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Credit Information */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📊 Credit Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Credit Score</label>
            <input
              type="number"
              value={financialProfile.creditScore}
              onChange={(e) => handleInputChange('creditScore', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="750"
              min="300"
              max="850"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Credit History Length</label>
            <select
              value={financialProfile.creditHistory}
              onChange={(e) => handleInputChange('creditHistory', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select length</option>
              <option value="none">No credit history</option>
              <option value="limited">Limited (&lt;2 years)</option>
              <option value="fair">Fair (2-5 years)</option>
              <option value="good">Good (5-10 years)</option>
              <option value="excellent">Excellent (10+ years)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assets */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">💰 Assets & Savings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Fund</label>
            <input
              type="number"
              value={financialProfile.emergencyFund}
              onChange={(e) => handleInputChange('emergencyFund', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$10,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Savings Account</label>
            <input
              type="number"
              value={financialProfile.savingsAccount}
              onChange={(e) => handleInputChange('savingsAccount', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$5,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Checking Account</label>
            <input
              type="number"
              value={financialProfile.checkingAccount}
              onChange={(e) => handleInputChange('checkingAccount', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$2,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">401(k) Balance</label>
            <input
              type="number"
              value={financialProfile.investments401k}
              onChange={(e) => handleInputChange('investments401k', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$50,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">IRA Balance</label>
            <input
              type="number"
              value={financialProfile.investmentsIRA}
              onChange={(e) => handleInputChange('investmentsIRA', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$25,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Other Investments</label>
            <input
              type="number"
              value={financialProfile.otherInvestments}
              onChange={(e) => handleInputChange('otherInvestments', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$15,000"
            />
          </div>
        </div>
      </Card>

      {/* Home Buying Information */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">🏠 Home Buying Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Down Payment</label>
            <input
              type="number"
              value={financialProfile.availableDownPayment}
              onChange={(e) => handleInputChange('availableDownPayment', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$50,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Home Price</label>
            <input
              type="number"
              value={financialProfile.targetHomePrice}
              onChange={(e) => handleInputChange('targetHomePrice', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="$300,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desired Location</label>
            <input
              type="text"
              value={financialProfile.desiredLocation}
              onChange={(e) => handleInputChange('desiredLocation', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="City, State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe for Buying</label>
            <select
              value={financialProfile.timeframeForBuying}
              onChange={(e) => handleInputChange('timeframeForBuying', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select timeframe</option>
              <option value="0-6months">0-6 months</option>
              <option value="6-12months">6-12 months</option>
              <option value="1-2years">1-2 years</option>
              <option value="2-5years">2-5 years</option>
              <option value="5+years">5+ years</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Monthly Expenses */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Monthly Expenses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(financialProfile.monthlyExpenses).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleNestedInputChange('monthlyExpenses', key, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="$0"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Save Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button
          onClick={saveProfile}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 text-lg"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
        <Button
          onClick={saveAndTest}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save & Try AI Advisor'}
        </Button>
      </div>
      
      {/* End Main Content */}
      </div>
      
      {/* End Full Container */}
    </div>
  );
};

export default FinancialProfileDetailed;
