import { ai, DEFAULT_GEMINI_MODEL } from '../config/gemini.js';
import {
  BusinessProfile,
  ChatMessage,
  IntakeState,
  BusinessCategory,
} from '../types.js';

export interface IntakeSessionResult {
  reply: string;
  profileComplete: boolean;
  progress: number;
  partialProfile: Partial<BusinessProfile>;
  profile?: BusinessProfile;
  missingFields: string[];
}

interface IntakeSessionData {
  sessionId: string;
  conversationHistory: ChatMessage[];
  partialProfile: Partial<BusinessProfile>;
  isComplete: boolean;
  createdAt: number;
  lastActiveAt: number;
}

const REQUIRED_PROFILE_FIELDS: (keyof BusinessProfile)[] = [
  'entrepreneurName',
  'businessName',
  'businessCategory',
  'location',
  'yearsInOperation',
  'monthlyRevenue',
  'monthlyFixedCosts',
  'monthlyVariableCosts',
  'seasonality',
  'existingDebts',
  'assets',
  'requestedLoanAmount',
];

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_DIR = path.resolve(__dirname, '../data');
const SESSIONS_FILE = path.resolve(SESSIONS_DIR, 'sessions.json');

/**
 * In-memory session store for conversational intake with disk persistence
 */
const sessionStore = new Map<string, IntakeSessionData>();

// Load persisted sessions on boot
try {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
  if (fs.existsSync(SESSIONS_FILE)) {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    for (const [k, v] of Object.entries(data)) {
      sessionStore.set(k, v as IntakeSessionData);
    }
  }
} catch (e) {
  // ignore init load error
}

function persistSessions(): void {
  try {
    if (!fs.existsSync(SESSIONS_DIR)) {
      fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }
    const obj: Record<string, IntakeSessionData> = {};
    for (const [k, v] of sessionStore.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }
}

/**
 * IntakeAgent
 * 
 * Conducts an adaptive, guided conversational interview with rural micro-entrepreneurs.
 * Uses Gemini API with specialized prompting for rural context, adaptive industry-specific
 * follow-ups, and incremental BusinessProfile extraction.
 */
export class IntakeAgent {
  private modelName: string;

  constructor(modelName = DEFAULT_GEMINI_MODEL) {
    this.modelName = modelName;
  }

  /**
   * Retrieves or initializes a session from the session store
   */
  public getOrCreateSession(sessionId: string): IntakeSessionData {
    let session = sessionStore.get(sessionId);
    if (!session) {
      try {
        if (fs.existsSync(SESSIONS_FILE)) {
          const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
          const data = JSON.parse(raw);
          if (data[sessionId]) {
            session = data[sessionId] as IntakeSessionData;
            sessionStore.set(sessionId, session);
            return session;
          }
        }
      } catch (e) {
        // ignore
      }

      session = {
        sessionId,
        conversationHistory: [],
        partialProfile: {
          existingDebts: [],
          assets: [],
          location: {
            villageOrTown: '',
            district: '',
            state: '',
            isRuralOrSemiUrban: true,
          },
          seasonality: {
            peakMonths: [],
            peakMonthlyRevenue: 0,
            leanMonths: [],
            leanMonthlyRevenue: 0,
            normalMonthlyRevenue: 0,
          },
        },
        isComplete: false,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };
      sessionStore.set(sessionId, session);
      persistSessions();
    }
    session.lastActiveAt = Date.now();
    return session;
  }

  /**
   * Resets or clears a session
   */
  public resetSession(sessionId: string): void {
    sessionStore.delete(sessionId);
    persistSessions();
  }

  /**
   * Handles a conversational turn for a given session
   */
  public async handleMessage(
    sessionId: string,
    userMessage: string
  ): Promise<IntakeSessionResult> {
    const session = this.getOrCreateSession(sessionId);

    // If initial empty trigger or greeting
    const isFirstMessage = session.conversationHistory.length === 0;

    if (userMessage.trim()) {
      session.conversationHistory.push({
        role: 'user',
        content: userMessage.trim(),
        timestamp: new Date().toISOString(),
      });
    }

    // Generate AI response and extract updated profile
    const agentTurn = await this.executeGeminiTurn(session, isFirstMessage);

    // Update session state
    session.partialProfile = this.mergeProfiles(session.partialProfile, agentTurn.extractedUpdates);
    
    // Add agent message to history
    session.conversationHistory.push({
      role: 'agent',
      content: agentTurn.reply,
      timestamp: new Date().toISOString(),
    });

    const completeness = this.calculateProgress(session.partialProfile);
    session.isComplete = agentTurn.profileComplete || completeness.isComplete;
    persistSessions();

    let fullProfile: BusinessProfile | undefined = undefined;
    if (session.isComplete) {
      fullProfile = this.normalizeToFullProfile(session.partialProfile);
    }

    return {
      reply: agentTurn.reply,
      profileComplete: session.isComplete,
      progress: completeness.progressPercentage,
      partialProfile: session.partialProfile,
      profile: fullProfile,
      missingFields: completeness.missingFields,
    };
  }

  /**
   * Executes a turn with Gemini with system prompting for adaptive intake
   */
  private async executeGeminiTurn(
    session: IntakeSessionData,
    isFirstMessage: boolean
  ): Promise<{
    reply: string;
    extractedUpdates: Partial<BusinessProfile>;
    profileComplete: boolean;
  }> {
    const systemPrompt = `You are "UDYORA Saathi", an empathetic, supportive, and intelligent rural micro-finance business counselor.
Your mission is to interview a rural/semi-urban micro-entrepreneur to understand their business financials, safe loan repayment capacity, and eligibility for government schemes (like MUDRA, PMEGP, PM SVANidhi).

CONVERSATIONAL GUIDELINES:
1. Tone: Friendly, respectful, empathetic, simple language.
2. Short & Focused: Ask ONLY ONE short question at a time. Never overwhelm the user with multiple financial questions in one turn.
3. No Jargon: Avoid complex financial terminology like "DSCR", "amortization", "EBITDA", "fixed vs variable cost breakdown". Instead ask: "Dukan ka mahine ka pakka kharcha (rent, bijli, helper) lagbhag kitna hai?" or "Daily/monthly bikri kitni ho jaati hai?"
4. Multilingual & Dialect Friendly: Understand Hinglish, Hindi, and English seamlessly. Respond in the primary language/dialect the user speaks (natural Hinglish or English).
5. ADAPTIVE INTELLIGENCE (Context-aware follow-ups):
   - If business is Tailoring / Garments / Boutique: Ask about festival demand spikes (Diwali, Eid, weddings, school uniforms season) and number of stitching machines.
   - If business is Street Vendor / Tea Stall / Food Cart: Ask about daily footfall variations (haat/bazaar days) and perishable wastage.
   - If business is Kirana / Grocery / General Store: Ask about local customer credit (udhaar/khata) and supplier credit terms.
   - If business is Agriculture / Dairy / Livestock: Ask about milking cattle count, daily milk yield, harvest seasons, and fodder costs.
   - If existing debts are from informal moneylenders (sahukar/mahajan): Gently ask about the interest rate or monthly payment to check if they are stuck in a high-cost debt trap.

PROFILE FIELDS TO GATHER:
1. entrepreneurName & businessName & location (village/town, district, state)
2. businessCategory (retail_kirana, agriculture_allied, dairy_livestock, handicrafts_artisan, food_processing_stall, textile_tailoring, repair_services, transport_logistics, other)
3. yearsInOperation
4. monthlyRevenue (average normal month sales)
5. monthlyFixedCosts (shop rent, electricity bill, helper wages)
6. monthlyVariableCosts (raw material inventory purchases, stock replenishment, transport)
7. seasonality (peak months & revenue, lean monsoon/drought months & revenue)
8. existingDebts (moneylender, bank loan, SHG loan, monthly EMI)
9. assets (machines, stock value, livestock, shop)
10. requestedLoanAmount & purpose (working capital, machinery expansion, inventory bulk buy)

OUTPUT FORMAT:
You MUST respond with a valid, clean JSON object matching this schema:
{
  "reply": "Your single short conversational question or response to the user",
  "extractedUpdates": {
    "entrepreneurName": "string or omit if not mentioned",
    "businessName": "string or omit",
    "businessCategory": "one of the category enum strings or omit",
    "businessDescription": "string or omit",
    "location": { "villageOrTown": "...", "district": "...", "state": "...", "isRuralOrSemiUrban": true },
    "yearsInOperation": number or omit,
    "monthlyRevenue": number (normalized INR number) or omit,
    "monthlyFixedCosts": number (normalized INR number) or omit,
    "monthlyVariableCosts": number (normalized INR number) or omit,
    "seasonality": {
      "peakMonths": ["October", "November"],
      "peakMonthlyRevenue": number,
      "leanMonths": ["June", "July"],
      "leanMonthlyRevenue": number,
      "normalMonthlyRevenue": number
    },
    "existingDebts": [
      {
        "id": "debt_1",
        "sourceType": "informal_moneylender" | "bank_mfi" | "friends_family" | "shg_loan" | "supplier_credit",
        "outstandingPrincipal": number,
        "monthlyEMI": number,
        "estimatedAnnualInterestRate": number
      }
    ],
    "assets": [
      {
        "id": "asset_1",
        "assetType": "machinery_equipment" | "inventory_stock" | "vehicle" | "land_building" | "gold_liquid",
        "description": "string",
        "estimatedMarketValue": number,
        "isPledgedOrHypothecated": false
      }
    ],
    "requestedLoanAmount": number or omit,
    "loanPurpose": "working_capital" | "machinery_expansion" | "inventory_bulk" | "debt_refinancing" or omit
  },
  "profileComplete": true or false (set to true ONLY when at least businessName, category, location, yearsInOperation, monthlyRevenue, costs, seasonality, debts, and loan amount are sufficiently collected)
}`;

    const conversationText = session.conversationHistory
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    const prompt = `${systemPrompt}

CURRENT EXTRACTED PROFILE STATE SO FAR:
${JSON.stringify(session.partialProfile, null, 2)}

CONVERSATION TRANSCRIPT:
${conversationText || '(Interview just starting. Greet warmly and ask for their name and business type)'}

Respond ONLY with the JSON object.`;

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const rawText = response.text?.trim() || '{}';
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        reply: parsed.reply || 'Namaste! Aapke vyapaar ke baare mein thoda aur batayein.',
        extractedUpdates: parsed.extractedUpdates || {},
        profileComplete: Boolean(parsed.profileComplete),
      };
    } catch (error: any) {
      console.error('[IntakeAgent] Error calling Gemini API:', error);

      // Fallback heuristic response if API call fails
      const currentKeys = Object.keys(session.partialProfile);
      let fallbackReply = 'Namaste! Main UDYORA Saathi hoon. Aapka naam kya hai aur aap kis cheez ka vyapaar karte hain?';
      if (session.partialProfile.businessCategory === 'textile_tailoring') {
        fallbackReply = 'Aapki tailoring shop mein tyoharon (festivals/wedding season) ke time bikri kitni badh jaati hai?';
      } else if (session.partialProfile.businessCategory === 'retail_kirana') {
        fallbackReply = 'Kirana dukan mein mahine ka lagbhag kitna saaman mangwate hain aur kitna munafa/bikri hoti hai?';
      } else if (currentKeys.length > 2) {
        fallbackReply = 'Aapko apne vyapaar ko aage badhane ke liye lagbhag kitne loan ki zaroorat hai?';
      }

      return {
        reply: fallbackReply,
        extractedUpdates: {},
        profileComplete: false,
      };
    }
  }

  /**
   * Merges existing profile with incoming delta updates
   */
  public mergeProfiles(
    target: Partial<BusinessProfile>,
    updates: Partial<BusinessProfile>
  ): Partial<BusinessProfile> {
    const merged: Partial<BusinessProfile> = { ...target };

    if (!updates) return merged;

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null) continue;

      if (key === 'location' && typeof value === 'object') {
        merged.location = {
          ...(merged.location || {
            villageOrTown: '',
            district: '',
            state: '',
            isRuralOrSemiUrban: true,
          }),
          ...value,
        };
      } else if (key === 'seasonality' && typeof value === 'object') {
        merged.seasonality = {
          ...(merged.seasonality || {
            peakMonths: [],
            peakMonthlyRevenue: 0,
            leanMonths: [],
            leanMonthlyRevenue: 0,
            normalMonthlyRevenue: 0,
          }),
          ...value,
        };
      } else if (key === 'existingDebts' && Array.isArray(value) && value.length > 0) {
        merged.existingDebts = value as any;
      } else if (key === 'assets' && Array.isArray(value) && value.length > 0) {
        merged.assets = value as any;
      } else {
        (merged as any)[key] = value;
      }
    }

    return merged;
  }

  /**
   * Process a single conversational turn in the interview (batch format compatibility)
   */
  public async processTurn(
    conversationHistory: ChatMessage[],
    currentProfile: Partial<BusinessProfile> = {}
  ): Promise<{
    agentName: string;
    success: boolean;
    timestamp: string;
    executionTimeMs: number;
    data: {
      message: string;
      extractedUpdates: Partial<BusinessProfile>;
      missingFields: string[];
      isComplete: boolean;
      nextSuggestedPrompt?: string;
    };
    agentNotes?: string[];
    errors?: string[];
  }> {
    const startTime = Date.now();
    try {
      const lastUserMsg = conversationHistory.filter(m => m.role === 'user').pop();
      const fakeSession: IntakeSessionData = {
        sessionId: 'transient-batch-session',
        conversationHistory: [...conversationHistory],
        partialProfile: { ...currentProfile },
        isComplete: false,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };

      const agentTurn = await this.executeGeminiTurn(fakeSession, conversationHistory.length === 0);
      const updatedProfile = this.mergeProfiles(currentProfile, agentTurn.extractedUpdates);
      const progress = this.calculateProgress(updatedProfile);

      return {
        agentName: 'IntakeAgent',
        success: true,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: {
          message: agentTurn.reply,
          extractedUpdates: updatedProfile,
          missingFields: progress.missingFields,
          isComplete: agentTurn.profileComplete || progress.isComplete,
          nextSuggestedPrompt: progress.isComplete ? undefined : 'Haan, humara monthly rent lagbhag ₹4,000 hai.',
        },
        agentNotes: [
          `Intake progress: ${progress.progressPercentage}%`,
          `Missing fields: ${progress.missingFields.join(', ') || 'None'}`,
        ],
      };
    } catch (error: any) {
      return {
        agentName: 'IntakeAgent',
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: {
          message: 'Error processing intake turn.',
          extractedUpdates: {},
          missingFields: [],
          isComplete: false,
        },
        errors: [error.message],
      };
    }
  }

  /**
   * Batch extracts a full structured BusinessProfile from an audio transcript or chat dump.
   */
  public async extractProfileFromTranscript(
    transcript: string
  ): Promise<{
    agentName: string;
    success: boolean;
    timestamp: string;
    executionTimeMs: number;
    data: Partial<BusinessProfile>;
    agentNotes?: string[];
    errors?: string[];
  }> {
    const startTime = Date.now();
    try {
      const prompt = `You are a financial data extraction engine for Indian rural micro-enterprises.
Extract a complete BusinessProfile JSON from the following interview transcript:

TRANSCRIPT:
${transcript}

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "entrepreneurName": "string",
  "businessName": "string",
  "businessCategory": "retail_kirana" | "agriculture_allied" | "dairy_livestock" | "handicrafts_artisan" | "food_processing_stall" | "textile_tailoring" | "repair_services" | "transport_logistics" | "other",
  "businessDescription": "string",
  "location": {
    "villageOrTown": "string",
    "district": "string",
    "state": "string",
    "isRuralOrSemiUrban": true
  },
  "yearsInOperation": number,
  "monthlyRevenue": number,
  "monthlyFixedCosts": number,
  "monthlyVariableCosts": number,
  "seasonality": {
    "peakMonths": ["string"],
    "peakMonthlyRevenue": number,
    "leanMonths": ["string"],
    "leanMonthlyRevenue": number,
    "normalMonthlyRevenue": number
  },
  "existingDebts": [
    {
      "id": "debt_1",
      "sourceType": "informal_moneylender" | "bank_mfi" | "friends_family" | "shg_loan" | "supplier_credit",
      "outstandingPrincipal": number,
      "monthlyEMI": number,
      "estimatedAnnualInterestRate": number
    }
  ],
  "assets": [
    {
      "id": "asset_1",
      "assetType": "machinery_equipment" | "inventory_stock" | "vehicle" | "land_building" | "gold_liquid",
      "description": "string",
      "estimatedMarketValue": number,
      "isPledgedOrHypothecated": false
    }
  ],
  "loanPurpose": "working_capital" | "machinery_expansion" | "inventory_bulk" | "debt_refinancing",
  "requestedLoanAmount": number,
  "requestedTenureMonths": number
}`;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const cleanJson = (response.text || '{}').replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const extracted = JSON.parse(cleanJson);

      return {
        agentName: 'IntakeAgent',
        success: true,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: extracted,
        agentNotes: ['Successfully extracted profile from transcript using Gemini AI.'],
      };
    } catch (error: any) {
      return {
        agentName: 'IntakeAgent',
        success: false,
        timestamp: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        data: {},
        errors: [error.message],
      };
    }
  }

  /**
   * Calculates field completeness progress percentage
   */
  public calculateProgress(profile: Partial<BusinessProfile>): {
    isComplete: boolean;
    progressPercentage: number;
    completedFields: string[];
    missingFields: string[];
  } {
    const completed: string[] = [];
    const missing: string[] = [];

    // Core validation checks
    if (profile.entrepreneurName) completed.push('entrepreneurName');
    else missing.push('entrepreneurName');

    if (profile.businessName) completed.push('businessName');
    else missing.push('businessName');

    if (profile.businessCategory) completed.push('businessCategory');
    else missing.push('businessCategory');

    if (profile.location?.villageOrTown || profile.location?.state) completed.push('location');
    else missing.push('location');

    if (typeof profile.yearsInOperation === 'number' && profile.yearsInOperation >= 0) completed.push('yearsInOperation');
    else missing.push('yearsInOperation');

    if (typeof profile.monthlyRevenue === 'number' && profile.monthlyRevenue > 0) completed.push('monthlyRevenue');
    else missing.push('monthlyRevenue');

    if (typeof profile.monthlyFixedCosts === 'number' && profile.monthlyFixedCosts >= 0) completed.push('monthlyFixedCosts');
    else missing.push('monthlyFixedCosts');

    if (typeof profile.monthlyVariableCosts === 'number' && profile.monthlyVariableCosts >= 0) completed.push('monthlyVariableCosts');
    else missing.push('monthlyVariableCosts');

    if (profile.seasonality && (profile.seasonality.peakMonthlyRevenue > 0 || profile.seasonality.leanMonthlyRevenue > 0)) {
      completed.push('seasonality');
    } else {
      missing.push('seasonality');
    }

    if (Array.isArray(profile.existingDebts)) completed.push('existingDebts');
    else missing.push('existingDebts');

    if (Array.isArray(profile.assets) && profile.assets.length > 0) completed.push('assets');
    else missing.push('assets');

    if (typeof profile.requestedLoanAmount === 'number' && profile.requestedLoanAmount > 0) completed.push('requestedLoanAmount');
    else missing.push('requestedLoanAmount');

    const progressPercentage = Math.min(100, Math.round((completed.length / REQUIRED_PROFILE_FIELDS.length) * 100));
    const isComplete = missing.length <= 1 && progressPercentage >= 85;

    return {
      isComplete,
      progressPercentage,
      completedFields: completed,
      missingFields: missing,
    };
  }

  /**
   * Normalizes partial profile to full guaranteed BusinessProfile
   */
  public normalizeToFullProfile(partial: Partial<BusinessProfile>): BusinessProfile {
    const revenue = partial.monthlyRevenue || 50000;
    const fixedCosts = partial.monthlyFixedCosts ?? Math.round(revenue * 0.1);
    const variableCosts = partial.monthlyVariableCosts ?? Math.round(revenue * 0.6);

    return {
      entrepreneurName: partial.entrepreneurName || 'Rural Entrepreneur',
      businessName: partial.businessName || 'Micro Enterprise',
      businessCategory: partial.businessCategory || 'retail_kirana',
      businessDescription: partial.businessDescription || '',
      location: {
        villageOrTown: partial.location?.villageOrTown || 'Rural Center',
        district: partial.location?.district || 'District',
        state: partial.location?.state || 'India',
        pincode: partial.location?.pincode,
        isRuralOrSemiUrban: partial.location?.isRuralOrSemiUrban ?? true,
      },
      demographics: partial.demographics || {
        gender: 'female',
        socialCategory: 'general',
        isFirstTimeBorrower: true,
      },
      yearsInOperation: partial.yearsInOperation || 2,
      entityType: partial.entityType || 'unregistered_sole_proprietor',
      monthlyRevenue: revenue,
      monthlyFixedCosts: fixedCosts,
      monthlyVariableCosts: variableCosts,
      seasonality: {
        peakMonths: partial.seasonality?.peakMonths?.length ? partial.seasonality.peakMonths : ['October', 'November', 'December'],
        peakMonthlyRevenue: partial.seasonality?.peakMonthlyRevenue || Math.round(revenue * 1.4),
        leanMonths: partial.seasonality?.leanMonths?.length ? partial.seasonality.leanMonths : ['June', 'July'],
        leanMonthlyRevenue: partial.seasonality?.leanMonthlyRevenue || Math.round(revenue * 0.7),
        normalMonthlyRevenue: revenue,
      },
      existingDebts: partial.existingDebts || [],
      assets: partial.assets || [
        {
          id: 'asset_default',
          assetType: 'inventory_stock',
          description: 'Working stock & basic equipment',
          estimatedMarketValue: Math.round(revenue * 0.8),
          isPledgedOrHypothecated: false,
        },
      ],
      loanPurpose: partial.loanPurpose || 'working_capital',
      requestedLoanAmount: partial.requestedLoanAmount || Math.round(revenue * 1.5),
      requestedTenureMonths: partial.requestedTenureMonths || 36,
    };
  }

  /**
   * Helper for batch compatibility with older methods
   */
  public evaluateCompleteness(profile: Partial<BusinessProfile>): {
    isComplete: boolean;
    missingFields: string[];
    progressPct: number;
  } {
    const res = this.calculateProgress(profile);
    return {
      isComplete: res.isComplete,
      missingFields: res.missingFields,
      progressPct: res.progressPercentage,
    };
  }
}
