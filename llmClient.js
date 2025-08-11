import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'your-api-key-here');

class LLMClient {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async generateResponse(prompt, context = {}) {
        try {
            const { userProfile, transactions, holdings, monthlyData, detailedProfile } = context;
            
            // Build comprehensive context prompt
            let contextPrompt = `You are an AI Financial Advisor. Here's the user's comprehensive financial information:

USER PROFILE:
${userProfile ? `
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Age: ${userProfile.age}
- Income: $${userProfile.income?.toLocaleString() || 'Not provided'}
- Financial Goals: ${userProfile.financialGoals || 'Not specified'}
- Risk Tolerance: ${userProfile.riskTolerance || 'Not specified'}
` : 'No basic profile information available.'}

${detailedProfile ? `
DETAILED FINANCIAL PROFILE:
Income & Employment:
- Annual Income: $${detailedProfile.currentIncome ? parseFloat(detailedProfile.currentIncome).toLocaleString() : 'Not provided'}
- Income Type: ${detailedProfile.incomeType || 'Not specified'}
- Employment Status: ${detailedProfile.employmentStatus || 'Not specified'}
- Job Stability: ${detailedProfile.jobStability || 'Not specified'}

Credit Information:
- Credit Score: ${detailedProfile.creditScore || 'Not provided'}
- Credit History: ${detailedProfile.creditHistory || 'Not specified'}

Current Debts:
${detailedProfile.debts && detailedProfile.debts.filter(d => d.balance && parseFloat(d.balance) > 0).length > 0 ? 
  detailedProfile.debts.filter(d => d.balance && parseFloat(d.balance) > 0).map(debt => 
    `- ${debt.type.replace('_', ' ')}: $${parseFloat(debt.balance).toLocaleString()} balance, $${parseFloat(debt.monthlyPayment || 0).toLocaleString()} monthly payment, ${debt.interestRate || 'N/A'}% interest rate`
  ).join('\n') : '- No current debts reported'}

Assets & Savings:
- Emergency Fund: $${detailedProfile.emergencyFund ? parseFloat(detailedProfile.emergencyFund).toLocaleString() : '0'}
- Savings Account: $${detailedProfile.savingsAccount ? parseFloat(detailedProfile.savingsAccount).toLocaleString() : '0'}
- 401(k) Balance: $${detailedProfile.investments401k ? parseFloat(detailedProfile.investments401k).toLocaleString() : '0'}
- IRA Balance: $${detailedProfile.investmentsIRA ? parseFloat(detailedProfile.investmentsIRA).toLocaleString() : '0'}
- Other Investments: $${detailedProfile.otherInvestments ? parseFloat(detailedProfile.otherInvestments).toLocaleString() : '0'}

Home Buying Goals:
- Available Down Payment: $${detailedProfile.availableDownPayment ? parseFloat(detailedProfile.availableDownPayment).toLocaleString() : 'Not specified'}
- Target Home Price: $${detailedProfile.targetHomePrice ? parseFloat(detailedProfile.targetHomePrice).toLocaleString() : 'Not specified'}
- Desired Location: ${detailedProfile.desiredLocation || 'Not specified'}
- Timeframe: ${detailedProfile.timeframeForBuying || 'Not specified'}

Monthly Expenses:
${detailedProfile.monthlyExpenses ? Object.entries(detailedProfile.monthlyExpenses)
  .filter(([key, value]) => value && parseFloat(value) > 0)
  .map(([key, value]) => `- ${key.replace(/([A-Z])/g, ' $1').trim()}: $${parseFloat(value).toLocaleString()}`)
  .join('\n') || '- No detailed monthly expenses provided' : '- No monthly expense breakdown available'}

Risk Profile:
- Risk Tolerance: ${detailedProfile.riskTolerance || 'Not specified'}
- Investment Experience: ${detailedProfile.investmentExperience || 'Not specified'}
- Financial Knowledge: ${detailedProfile.financialKnowledge || 'Not specified'}
` : 'No detailed financial profile available. User should complete the comprehensive financial profile for better advice.'}

RECENT TRANSACTIONS:
${transactions && transactions.length > 0 ? transactions.slice(0, 10).map(t => 
    `- ${t.description}: $${t.amount} (${t.date})`
).join('\n') : 'No transaction data available.'}

INVESTMENT HOLDINGS:
${holdings && holdings.length > 0 ? holdings.map(h => 
    `- ${h.symbol}: ${h.shares} shares at $${h.currentPrice} (Total: $${(h.shares * h.currentPrice).toFixed(2)})`
).join('\n') : 'No investment holdings data available.'}

MONTHLY FINANCIAL DATA:
${monthlyData && monthlyData.length > 0 ? monthlyData.slice(-6).map(m => 
    `- ${m.month}: Income $${m.income}, Expenses $${m.expenses}, Savings $${m.savings}`
).join('\n') : 'No monthly data available.'}

Based on this comprehensive financial context, please provide specific, actionable financial advice. Reference the user's actual financial situation, including specific numbers where relevant. If critical information is missing for home buying advice (like debt details, credit score, or down payment amount), specifically mention what additional information would be helpful.

USER QUESTION: ${prompt}`;

            const result = await this.model.generateContent(contextPrompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error('LLM Error:', error);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }
}

export default new LLMClient();
