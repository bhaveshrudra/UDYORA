import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import {
  defaultOrchestrator,
  runUdyoraPipeline,
  BusinessProfile,
  ChatMessage,
} from './orchestrator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// CORS headers for Vite frontend communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ==========================================
// Health & Diagnostic Routes
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'UDYORA Multi-Agent AI Backend',
    timestamp: new Date().toISOString(),
    registeredAgents: [
      'IntakeAgent',
      'FinancialEngineAgent',
      'RiskAssessmentAgent',
      'SchemeMatchingAgent',
      'OrchestratorAgent',
    ],
  });
});

// ==========================================
// 1. Intake Agent Routes
// ==========================================

/**
 * Adaptive conversational intake endpoint
 * Accepts { sessionId, message }
 * Returns { reply, profileComplete, profile?, partialProfile, progress, missingFields }
 */
app.post('/api/intake', async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body as {
      sessionId?: string;
      message?: string;
    };

    if (!sessionId) {
      res.status(400).json({
        success: false,
        error: 'sessionId is required.',
      });
      return;
    }

    const intakeAgent = defaultOrchestrator.getIntakeAgent();
    const result = await intakeAgent.handleMessage(sessionId, message || '');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing intake message',
    });
  }
});

app.post('/api/intake/reset', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body as { sessionId?: string };
    if (sessionId) {
      defaultOrchestrator.getIntakeAgent().resetSession(sessionId);
    }
    res.json({ success: true, message: `Session ${sessionId} reset successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/intake/chat', async (req: Request, res: Response) => {
  try {
    const { conversationHistory, currentProfile } = req.body as {
      conversationHistory: ChatMessage[];
      currentProfile?: Partial<BusinessProfile>;
    };

    const intakeAgent = defaultOrchestrator.getIntakeAgent();
    const result = await intakeAgent.processTurn(conversationHistory || [], currentProfile || {});
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/intake/extract', async (req: Request, res: Response) => {
  try {
    const { transcript } = req.body as { transcript: string };
    const intakeAgent = defaultOrchestrator.getIntakeAgent();
    const result = await intakeAgent.extractProfileFromTranscript(transcript || '');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. Financial Engine Agent Routes
// ==========================================

/**
 * Deterministic Financial Analysis endpoint
 * Accepts { sessionId?: string; profile?: BusinessProfile }
 * Returns FinancialAnalysis object
 */
app.post('/api/financial-analysis', async (req: Request, res: Response) => {
  try {
    const { sessionId, profile } = req.body as {
      sessionId?: string;
      profile?: BusinessProfile;
    };

    let targetProfile: BusinessProfile | undefined = profile;

    if (!targetProfile && sessionId) {
      const intakeAgent = defaultOrchestrator.getIntakeAgent();
      const session = intakeAgent.getOrCreateSession(sessionId);
      if (session.conversationHistory.length === 0 && Object.keys(session.partialProfile).length <= 2) {
        res.status(400).json({
          success: false,
          error: `No business profile found for sessionId '${sessionId}'. Complete intake first.`,
        });
        return;
      }
      targetProfile = intakeAgent.normalizeToFullProfile(session.partialProfile);
    }

    if (!targetProfile) {
      res.status(400).json({
        success: false,
        error: 'Either sessionId or profile must be provided in request body.',
      });
      return;
    }

    const financialAgent = defaultOrchestrator.getFinancialEngineAgent();
    const analysis = financialAgent.analyze(targetProfile);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/financial/analyze', async (req: Request, res: Response) => {
  try {
    const profile = req.body as BusinessProfile;
    const financialAgent = defaultOrchestrator.getFinancialEngineAgent();
    const result = await financialAgent.runFinancialEngine(profile);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. Risk Assessment Agent Routes
// ==========================================
app.post('/api/risk/assess', async (req: Request, res: Response) => {
  try {
    const { profile, financialMetrics } = req.body as {
      profile: BusinessProfile;
      financialMetrics: any;
    };
    const riskAgent = defaultOrchestrator.getRiskAssessmentAgent();
    const result = await riskAgent.assessRisk(profile, financialMetrics);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. Scheme Matching Agent Routes
// ==========================================
app.post('/api/schemes/match', async (req: Request, res: Response) => {
  try {
    const { profile, financialMetrics, riskMetrics } = req.body as {
      profile: BusinessProfile;
      financialMetrics: any;
      riskMetrics: any;
    };
    const schemeAgent = defaultOrchestrator.getSchemeMatchingAgent();
    const result = await schemeAgent.matchSchemes(profile, financialMetrics, riskMetrics);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. Orchestrator Pipeline Route (End-to-End)
// ==========================================
app.post('/api/pipeline/run', async (req: Request, res: Response) => {
  try {
    const profile = req.body as BusinessProfile;
    if (!profile || !profile.businessName) {
      res.status(400).json({
        success: false,
        error: 'Missing required profile payload in request body.',
      });
      return;
    }

    const result = await runUdyoraPipeline(profile);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[UDYORA Backend] Multi-Agent AI Server running on http://localhost:${PORT}`);
  });
}

export default app;
