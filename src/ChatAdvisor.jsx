import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { db } from './firebase';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc, serverTimestamp, addDoc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ProfileForm from './ProfileForm';
import Typewriter from './components/Typewriter';
import ReactMarkdown from 'react-markdown';

// Blinking cursor component
const BlinkingCursor = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible(v => !v), 500);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-2 animate-blink">{visible ? '|' : ' '}</span>;
};

// Voice replay button component
const VoiceReplayButton = ({ text, isActive = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);
  }, []);

  const handleReplay = () => {
    if (!isSupported || !text) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported || !isActive) return null;

  return (
    <button
      onClick={handleReplay}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isPlaying
          ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
          : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
      }`}
      title={isPlaying ? 'Stop playback' : 'Replay message'}
    >
      {isPlaying ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Stop
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Replay
        </>
      )}
    </button>
  );
};

// Enhanced paragraph card component
const ParagraphCard = ({ children, className = "", isHighlighted = false }) => {
  return (
    <div className={`
      bg-white rounded-lg border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200
      ${isHighlighted ? 'ring-2 ring-blue-200 bg-blue-50' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Structured output component with enhanced styling
const StructuredOutput = ({ data }) => {
  if (!data) return null;

  // In StructuredOutput, add a helper to safely render values
  const renderValue = (value) => {
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  };

  const FinanceMetricCard = ({ icon, title, value, description, color = 'blue', className = '' }) => (
    <div className={`rounded-xl border-l-8 bg-white shadow-sm p-4 mb-3 flex items-center gap-4 border-${color}-400 ${className}`}>
      <div className={`text-3xl`}>{icon}</div>
      <div>
        <div className="font-semibold text-gray-800 text-lg mb-1 flex items-center gap-2">{title}</div>
        <div className="text-gray-700 text-base font-mono">{value}</div>
        {description && <div className="text-gray-500 text-sm mt-1">{description}</div>}
      </div>
    </div>
  );

  return (
    <div className="structured-output space-y-4 mt-4">
      {/* Summary */}
      {data.summary && (
        <ParagraphCard isHighlighted={true}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Summary
              </h4>
              <div className="text-gray-700 prose prose-sm max-w-none">
                <ReactMarkdown>{data.summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        </ParagraphCard>
      )}

      {/* Prioritized Recommendations */}
      {Array.isArray(data.prioritizedRecommendations) && data.prioritizedRecommendations.length > 0 && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Prioritized Recommendations
          </h4>
          <div className="space-y-3">
            {(data.prioritizedRecommendations || []).map((rec, index) => (
              <div key={index} className={`
                p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm
                ${rec.priority === 'high' ? 'border-red-400 bg-red-50' : 
                  rec.priority === 'medium' ? 'border-yellow-400 bg-yellow-50' : 
                  'border-green-400 bg-green-50'}
              `}>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 mb-1">{rec.recommendation}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium">Source:</span> {renderValue(rec.source)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="font-medium">Category:</span> {renderValue(rec.category)}
                        </span>
                      </div>
                      {rec.timeline && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Timeline:</span> {renderValue(rec.timeline)}
                        </div>
                      )}
                      {rec.impact && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Impact:</span> {renderValue(rec.impact)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                    ${rec.priority === 'high' ? 'bg-red-100 text-red-800' : 
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}
                  `}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ParagraphCard>
      )}

      {/* Action Plan */}
      {Array.isArray(data.actionPlan) && data.actionPlan.length > 0 && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">📅</span>
            Action Plan
          </h4>
          <div className="space-y-4">
            {(data.actionPlan || []).map((plan, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">⏰</span>
                  {plan.timeframe}
                </h5>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {(plan.actions || []).map((action, actionIndex) => (
                    <li key={actionIndex} className="text-gray-700 text-sm leading-relaxed">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ParagraphCard>
      )}

      {/* Risk Assessment */}
      {data.riskAssessment && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Risk Assessment
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-800">Overall Risk Level:</span>
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${data.riskAssessment.overallRisk === 'high' ? 'bg-red-100 text-red-800' : 
                  data.riskAssessment.overallRisk === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'}
              `}>
                {data.riskAssessment.overallRisk.toUpperCase()}
              </span>
            </div>
            
            {Array.isArray(data.riskAssessment.risks) && data.riskAssessment.risks.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <div className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  Identified Risks
                </div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {(data.riskAssessment.risks || []).map((risk, index) => (
                    <li key={index} className="text-gray-700 text-sm leading-relaxed">{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(data.riskAssessment.mitigations) && data.riskAssessment.mitigations.length > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  Mitigation Strategies
                </div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {(data.riskAssessment.mitigations || []).map((mitigation, index) => (
                    <li key={index} className="text-gray-700 text-sm leading-relaxed">{mitigation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ParagraphCard>
      )}

      {/* Next Steps */}
      {Array.isArray(data.nextSteps) && data.nextSteps.length > 0 && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">🚀</span>
            Next Steps
          </h4>
          <div className="bg-blue-50 rounded-lg p-3">
            <ol className="list-decimal list-inside space-y-2 ml-2">
              {(data.nextSteps || []).map((step, index) => (
                <li key={index} className="text-gray-700 text-sm leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        </ParagraphCard>
      )}

      {/* Confidence Score */}
      {data.confidence && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Analysis Confidence
          </h4>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${data.confidence}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
                {data.confidence}%
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Based on data availability and analysis quality
            </div>
          </div>
        </ParagraphCard>
      )}

      {/* Savings Rate */}
      {data.savingsRate !== undefined && (
        <FinanceMetricCard
          icon="💰"
          title="Savings Rate"
          value={`${data.savingsRate}%`}
          description={data.savingsAnalysis?.advice}
          color="green"
        />
      )}

      {/* Emergency Fund Status */}
      {data.emergencyFundStatus && (
        <FinanceMetricCard
          icon="🛡️"
          title="Emergency Fund"
          value={data.emergencyFundStatus}
          color="blue"
        />
      )}

      {/* Goal Feasibility */}
      {data.goalFeasibility && (
        <FinanceMetricCard
          icon="🎯"
          title="Goal Feasibility"
          value={data.goalFeasibility}
          color="purple"
        />
      )}

      {/* Debt-to-Income Ratio */}
      {data.debtToIncomeRatio !== undefined && (
        <FinanceMetricCard
          icon="📉"
          title="Debt-to-Income Ratio"
          value={`${data.debtToIncomeRatio}%`}
          color={data.debtToIncomeRatio > 35 ? 'red' : 'yellow'}
          description={data.debtToIncomeRatio > 35 ? 'Warning: High debt load!' : undefined}
        />
      )}

      {/* Warnings */}
      {Array.isArray(data.warnings) && data.warnings.length > 0 && (
        <ParagraphCard isHighlighted className="border-red-400 ring-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold text-lg">
            <span className="text-2xl">⚠️</span> Warnings
          </div>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {data.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </ParagraphCard>
      )}

      {/* Diversification */}
      {data.diversification && (
        <FinanceMetricCard
          icon="📊"
          title="Portfolio Diversification"
          value={`Equity: ${data.diversification.equity}, Debt: ${data.diversification.debt}, Gold: ${data.diversification.gold}`}
          color="yellow"
          description={data.diversification.warning}
        />
      )}

      {/* Tax Analysis */}
      {data.taxAnalysis && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-xl">🧾</span>
            Tax Analysis
          </h4>
          <div className="text-gray-700 text-sm">
            <div><b>Current Tax Liability:</b> ₹{data.taxAnalysis.currentTaxLiability}</div>
            <div><b>Potential Savings:</b> ₹{data.taxAnalysis.potentialSavings}</div>
            {Array.isArray(data.taxAnalysis.recommendations) && data.taxAnalysis.recommendations.length > 0 && (
              <div className="mt-2">
                <b>Recommendations:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.taxAnalysis.recommendations.map((rec, i) => (
                    <li key={i}>
                      {rec.investment ? <b>{rec.investment}</b> : null} - ₹{rec.amount} ({rec.taxBenefit}) <span className="uppercase text-xs ml-2">{rec.priority}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ParagraphCard>
      )}

      {/* SIP Recommendations */}
      {data.sipRecommendations && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-xl">💸</span>
            SIP Recommendations
          </h4>
          <div className="text-gray-700 text-sm">
            <div><b>Suggested SIP Amount:</b> ₹{data.sipRecommendations.suggestedAmount}</div>
            <div><b>Allocation:</b> Equity {Math.round(data.sipRecommendations.allocation.equity*100)}%, Debt {Math.round(data.sipRecommendations.allocation.debt*100)}%, Gold {Math.round(data.sipRecommendations.allocation.gold*100)}%</div>
            {Array.isArray(data.sipRecommendations.funds) && data.sipRecommendations.funds.length > 0 && (
              <div className="mt-2">
                <b>Suggested Funds:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.sipRecommendations.funds.map((fund, i) => (
                    <li key={i}>
                      <b>{fund.category}:</b> {fund.suggestedFunds.join(', ')} (₹{fund.allocation})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ParagraphCard>
      )}

      {/* Investment Strategy */}
      {data.investmentStrategy && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-xl">📈</span>
            Investment Strategy
          </h4>
          <div className="text-gray-700 text-sm">
            {Array.isArray(data.investmentStrategy.shortTerm) && data.investmentStrategy.shortTerm.length > 0 && (
              <div className="mb-2">
                <b>Short Term:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.investmentStrategy.shortTerm.map((item, i) => (
                    <li key={i}>{item.goal} - {item.investment} (₹{item.amount}, {item.timeframe})</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(data.investmentStrategy.longTerm) && data.investmentStrategy.longTerm.length > 0 && (
              <div className="mb-2">
                <b>Long Term:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.investmentStrategy.longTerm.map((item, i) => (
                    <li key={i}>{item.goal} - {item.investment} (₹{item.amount}, {item.timeframe})</li>
                  ))}
                </ul>
              </div>
            )}
            {data.investmentStrategy.retirement && (
              <div>
                <b>Retirement:</b> Required Corpus: ₹{data.investmentStrategy.retirement.requiredCorpus}, Monthly Investment: ₹{data.investmentStrategy.retirement.monthlyInvestment}, Strategy: {data.investmentStrategy.retirement.strategy}
              </div>
            )}
          </div>
        </ParagraphCard>
      )}

      {/* Planner Breakdown */}
      {data.planner && data.planner.plan && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-xl">📝</span>
            Planner Breakdown
          </h4>
          <div className="text-gray-700 text-sm">
            {Array.isArray(data.planner.plan.subtasks) && data.planner.plan.subtasks.length > 0 && (
              <div className="mb-2">
                <b>Subtasks:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.planner.plan.subtasks.map((task, i) => (
                    <li key={i}>{task.task} ({task.priority}, {task.estimatedTime}) - {task.description}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(data.planner.plan.financialImpact) && data.planner.plan.financialImpact.length > 0 && (
              <div className="mb-2">
                <b>Financial Impact:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.planner.plan.financialImpact.map((impact, i) => (
                    <li key={i}>{impact.aspect}: {impact.impact} ({impact.magnitude}, {impact.timeframe})</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(data.planner.plan.considerations) && data.planner.plan.considerations.length > 0 && (
              <div className="mb-2">
                <b>Considerations:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.planner.plan.considerations.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.planner.plan.timeline && (
              <div><b>Timeline:</b> {data.planner.plan.timeline}</div>
            )}
          </div>
        </ParagraphCard>
      )}

      {/* Data Analysis */}
      {data.dataAnalysis && data.dataAnalysis.analysis && (
        <ParagraphCard>
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Data Analysis
          </h4>
          <div className="text-gray-700 text-sm">
            {data.dataAnalysis.analysis.summary && <div><b>Summary:</b> {data.dataAnalysis.analysis.summary}</div>}
            {data.dataAnalysis.analysis.incomeTrends && (
              <div><b>Income Trends:</b> {data.dataAnalysis.analysis.incomeTrends.trend}, Avg: ₹{data.dataAnalysis.analysis.incomeTrends.averageMonthly}</div>
            )}
            {data.dataAnalysis.analysis.expenseTrends && (
              <div><b>Expense Trends:</b> {data.dataAnalysis.analysis.expenseTrends.trend}, Avg: ₹{data.dataAnalysis.analysis.expenseTrends.averageMonthly}</div>
            )}
            {data.dataAnalysis.analysis.savingsAnalysis && (
              <div><b>Savings Analysis:</b> {data.dataAnalysis.analysis.savingsAnalysis.trend}, Avg: ₹{data.dataAnalysis.analysis.savingsAnalysis.averageMonthlySavings}</div>
            )}
            {Array.isArray(data.dataAnalysis.analysis.recommendations) && data.dataAnalysis.analysis.recommendations.length > 0 && (
              <div className="mt-2">
                <b>Recommendations:</b>
                <ul className="list-disc list-inside ml-4">
                  {data.dataAnalysis.analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec.recommendation} ({rec.category}, {rec.priority})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ParagraphCard>
      )}

      {/* Savings Consistency */}
      {data.savingsConsistency && (
        <FinanceMetricCard
          icon="💹"
          title="Savings Consistency"
          value={data.savingsConsistency}
          color="green"
        />
      )}

      {/* Cash Flow Health */}
      {data.cashFlowHealth && (
        <FinanceMetricCard
          icon="💵"
          title="Cash Flow Health"
          value={data.cashFlowHealth}
          color={data.cashFlowHealth.includes('positive') ? 'green' : 'red'}
        />
      )}

      {/* Custom Alerts */}
      {Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <ParagraphCard isHighlighted className="border-yellow-400 ring-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-2 mb-2 text-yellow-700 font-semibold text-lg">
            <span className="text-2xl">🔔</span> Alerts
          </div>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {data.alerts.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </ParagraphCard>
      )}
    </div>
  );
};

const ErrorCard = ({ message, onRetry }) => (
  <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 mb-4 flex items-center justify-between gap-4 animate-pulse">
    <div className="flex items-center gap-2">
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
      </svg>
      <span className="font-semibold">{message}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded font-medium text-sm transition-colors duration-200"
      >
        Retry
      </button>
    )}
  </div>
);

// Utility to check for placeholder or empty values
const isPlaceholder = (val) => {
  if (!val) return true;
  const str = String(val).toLowerCase().trim();
  return (
    str === 'placeholder summary' ||
    str === 'n/a' ||
    str === 'undefined' ||
    str === 'null' ||
    str === ''
  );
};

// Utility to format date strings (YYYY-MM-DD to Month DD, YYYY)
const formatDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [_, y, m, d] = match;
    return new Date(`${y}-${m}-${d}T00:00:00Z`).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
  return dateStr;
};

// Recursively clean structured data
const cleanStructuredData = (data) => {
  if (Array.isArray(data)) {
    return data
      .map(cleanStructuredData)
      .filter((item) => !isPlaceholder(item) && item !== null && item !== undefined && item !== '');
  } else if (typeof data === 'object' && data !== null) {
    const cleaned = {};
    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      let value = data[key];
      // Format dates
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('timeline')) {
        value = formatDate(value);
      }
      // Recursively clean
      value = cleanStructuredData(value);
      if (!isPlaceholder(value) && value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }
  return isPlaceholder(data) ? null : data;
};

const ChatAdvisor = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]); // Chat history
  const [loading, setLoading] = useState(false);
  const [structuredData, setStructuredData] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const chatEndRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const [abortController, setAbortController] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [mode, setMode] = useState('basic'); // 'basic' or 'deep'
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setFetching(true);
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
            setError('');
          } else {
            setProfile(null);
            setError('');
          }
        } catch (err) {
          setError('Failed to fetch financial profile.');
        } finally {
          setFetching(false);
        }
      } else {
        setFetching(false);
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Fetch transactions
    const fetchTransactions = async () => {
      try {
        const txCol = collection(db, 'transactions', user.uid, 'items');
        const txSnap = await getDocs(txCol);
        setTransactions(txSnap.docs.map(doc => doc.data()));
      } catch {
        setTransactions([]);
      }
    };
    // Fetch holdings
    const fetchHoldings = async () => {
      try {
        const hCol = collection(db, 'holdings', user.uid, 'items');
        const hSnap = await getDocs(hCol);
        setHoldings(hSnap.docs.map(doc => doc.data()));
      } catch {
        setHoldings([]);
      }
    };
    fetchTransactions();
    fetchHoldings();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Fetch monthly data (same as Dashboard)
    const fetchMonthlyData = async () => {
      setMonthlyLoading(true);
      try {
        const monthlyCol = collection(db, 'users', user.uid, 'monthlyData');
        const monthlySnap = await getDocs(monthlyCol);
        const data = monthlySnap.docs.map(doc => doc.data());
        setMonthlyData(data);
      } catch {
        setMonthlyData([]);
      } finally {
        setMonthlyLoading(false);
      }
    };
    fetchMonthlyData();
  }, [user]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Load latest messages on mount or user change
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) {
        setChatHistory([]);
        setMessages([]);
        setLastVisible(null);
        setHasMore(true);
        return;
      }
      try {
        const messagesCol = collection(db, 'chats', user.uid, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'desc'), limit(PAGE_SIZE));
        const snap = await getDocs(q);
        const msgs = [];
        snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
        const reversedMsgs = msgs.reverse();
        setChatHistory(reversedMsgs);
        
        // Convert Firestore messages to API format for conversation history
        const apiMessages = reversedMsgs.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message,
          timestamp: msg.timestamp?.toDate?.() || new Date(),
          structuredData: msg.structuredData || null
        }));
        setMessages(apiMessages);
        
        setLastVisible(snap.docs[snap.docs.length - 1]);
        setHasMore(snap.size === PAGE_SIZE);
      } catch (err) {
        setChatHistory([]);
        setMessages([]);
        setLastVisible(null);
        setHasMore(false);
      }
    };
    fetchChatHistory();
  }, [user]);

  const loadOlderMessages = async () => {
    if (!user || !lastVisible) return;
    const messagesCol = collection(db, 'chats', user.uid, 'messages');
    const q = query(messagesCol, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE));
    const snap = await getDocs(q);
    const msgs = [];
    snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() }));
    const reversedMsgs = msgs.reverse();
    setChatHistory(prev => [...reversedMsgs, ...prev]);
    
    // Update API messages with older messages
    const apiMessages = reversedMsgs.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message,
      timestamp: msg.timestamp?.toDate?.() || new Date(),
      structuredData: msg.structuredData || null
    }));
    setMessages(prev => [...apiMessages, ...prev]);
    
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.size === PAGE_SIZE);
  };

  const handleProfileSaved = async () => {
    setFetching(true);
    setError('');
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      }
    } catch {
      setError('Failed to fetch financial profile.');
    } finally {
      setFetching(false);
    }
  };

  // Save a message to Firestore
  const saveMessage = async (msgObj) => {
    if (!user) return;
    const messagesCol = collection(db, 'chats', user.uid, 'messages');
    await addDoc(messagesCol, msgObj);
  };

  const handleSubmit = async (e, retryQuestion = null) => {
    e.preventDefault();
    setError('');
    setLastError(null);
    if (!user) {
      setError('Please log in to use the advisor.');
      setShowToast(true);
      return;
    }
    if (!profile) {
      setError('No financial profile found.');
      setShowToast(true);
      return;
    }
    const userQuestion = retryQuestion || question;
    if (!userQuestion.trim()) {
      setError('Please enter a question.');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setStructuredData(null);
    setQuestion('');

    // Save user message to Firestore and local chat
    const userMsg = { sender: 'user', message: userQuestion, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    await saveMessage({ ...userMsg, timestamp: serverTimestamp() });

    // Append user message to chat
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userQuestion, timestamp: new Date() }
    ]);

    try {
      // Call new advisor endpoint
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userQuestion })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Use toolResult as the AI's response
      const aiMsg = {
        role: 'assistant',
        content: data.toolResult?.result || JSON.stringify(data.toolResult) || 'No response',
        timestamp: new Date(),
        structuredData: data.toolResult?.structuredData || null
      };
      setMessages(prev => [...prev, aiMsg]);
      // Save advisor message to Firestore
      const advisorMsg = { sender: 'advisor', message: aiMsg.content, timestamp: new Date(), structuredData: aiMsg.structuredData };
      setChatHistory(prev => [...prev, advisorMsg]);
      await saveMessage({ ...advisorMsg, timestamp: serverTimestamp() });
    } catch (err) {
      setError('Failed to get response from advisor.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter/Shift+Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && question.trim()) {
        handleSubmit(e);
      }
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    setChatHistory([]);
    setStructuredData(null);
    setError('');
  };

  // Toggle voice functionality
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  if (!profile) {
    return <ProfileForm onProfileSaved={handleProfileSaved} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Mode selection UI */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="chat-mode-select" style={{ fontWeight: 'bold', marginRight: 8 }}>Chat Mode:</label>
        <select
          id="chat-mode-select"
          value={mode}
          onChange={e => setMode(e.target.value)}
          style={{ padding: 4, borderRadius: 4 }}
        >
          <option value="basic">Basic Chat</option>
          <option value="deep">Deep Financial Analysis</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Financial Advisor</h1>
              <p className="text-blue-100 mt-1">
                Ask complex financial questions and get comprehensive analysis from multiple AI agents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleVoice}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  voiceEnabled 
                    ? 'bg-white text-blue-600 hover:bg-blue-50' 
                    : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
                title={voiceEnabled ? 'Disable voice features' : 'Enable voice features'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                {voiceEnabled ? 'Voice On' : 'Voice Off'}
              </button>
              <button 
                onClick={handleClearChat} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-[600px] overflow-y-auto p-6 bg-gray-50">
          {hasMore && (
            <div className="text-center mb-4">
              <button 
                onClick={loadOlderMessages} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors duration-200"
              >
                Load older messages
              </button>
            </div>
          )}
          
          {chatHistory.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to your AI Financial Advisor</h3>
              <p className="text-gray-600 mb-4">Ask your first question to start the conversation.</p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-700 font-medium mb-2">Try asking:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "Can I afford to buy a house?"</li>
                  <li>• "What's the best investment strategy for me?"</li>
                  <li>• "How should I plan for retirement?"</li>
                </ul>
              </div>
            </div>
          )}
          
          {lastError && (
            <ErrorCard message={lastError} onRetry={() => handleSubmit({ preventDefault: () => {} }, messages[messages.length - 2]?.content)} />
          )}

          {chatHistory.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const isAdvisor = msg.sender === 'advisor' || msg.sender === 'assistant';
            const isLastAdvisor = isAdvisor && idx === chatHistory.length - 1;
            
            return (
              <div key={msg.id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
                <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
                  {/* Avatar */}
                  <div className={`flex items-center gap-3 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        🤖
                      </div>
                    )}
                    <div className={`text-sm text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
                      {isUser ? 'You' : 'AI Advisor'}
                    </div>
                    {isUser && (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`
                    rounded-2xl p-4 shadow-sm
                    ${isUser 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : 'bg-white border border-gray-200'
                    }
                  `}>
                    <div className="prose prose-sm max-w-none">
                      {isLastAdvisor && loading ? (
                        <div className="text-gray-800">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          AI Advisor is thinking...
                        </div>
                      ) : (
                        <div className={isUser ? 'text-white' : 'text-gray-800'}>
                          {msg.error ? (
                            <ErrorCard message={msg.error} onRetry={() => handleSubmit({ preventDefault: () => {} }, msg.content)} />
                          ) : (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Voice replay button for advisor messages */}
                    {isAdvisor && !loading && voiceEnabled && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <VoiceReplayButton text={msg.content} isActive={voiceEnabled} />
                      </div>
                    )}
                    
                    {/* Structured output for advisor messages */}
                    {isAdvisor && msg.structuredData && !loading && (
                      <>
                        {console.log('StructuredData for advisor:', msg.structuredData)}
                        <StructuredOutput data={cleanStructuredData(msg.structuredData)} />
                      </>
                    )}
                    
                    {/* Timestamp */}
                    <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.timestamp && msg.timestamp.toDate ? 
                        msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                        (msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : String(msg.timestamp))
                      }
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="flex justify-start mb-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    🤖
                  </div>
                  <div className="text-sm text-gray-500">AI Advisor</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Analyzing your question with multiple AI agents...
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6 bg-white">
          {/* Stop Generating button */}
          {loading && (
            <button 
              onClick={() => {}} 
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold mb-4 transition-colors duration-200"
            >
              Stop Generating
            </button>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask a financial question:
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                disabled={loading}
                required
                placeholder="e.g., Can I afford to buy a house? What's the best investment strategy for me? How should I plan for retirement?"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !question.trim()} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 'Ask AI Advisor'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Error Toast */}
      {showToast && error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChatAdvisor; 