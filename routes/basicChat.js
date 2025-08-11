import express from 'express';
import llmClient from '../llmClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message, userProfile, transactions, holdings, monthlyData, detailedProfile } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        console.log('Basic chat request received:', {
            message: message.substring(0, 100) + '...',
            hasProfile: !!userProfile,
            hasDetailedProfile: !!detailedProfile,
            transactionCount: transactions?.length || 0,
            holdingsCount: holdings?.length || 0,
            monthlyDataCount: monthlyData?.length || 0
        });

        // Prepare context for LLM
        const context = {
            userProfile,
            transactions,
            holdings,
            monthlyData,
            detailedProfile
        };

        // Generate response using LLM
        const response = await llmClient.generateResponse(message, context);

        console.log('LLM response generated successfully');

        res.json({
            response: response,
            mode: 'basic',
            timestamp: new Date().toISOString(),
            hasDetailedProfile: !!detailedProfile
        });

    } catch (error) {
        console.error('Basic chat error:', error);
        res.status(500).json({ 
            error: 'Failed to process basic chat request',
            details: error.message
        });
    }
});

export default router;
