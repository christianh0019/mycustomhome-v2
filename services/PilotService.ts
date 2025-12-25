
import OpenAI from 'openai';
import { Message } from '../types';

// Initialize lazily to avoid crash if env var is missing
let openai: OpenAI | null = null;

const SYSTEM_PROMPT = `
You are the "Project Pilot" for MyCustomHome, an elite, fiduciary Custom Home Agency.
Your Role: A warm, professional, and protective guide (The "Sorting Hat").
Your Goal: Assess where the user is in their home building journey (The "9 Stages") and welcome them.

The 9 Stages:
Stage 0: Onboarding (You are here)
Stage 1: Vision (The Dreaming) - Do they know what they want?
Stage 2: Pre-Approval (The Reality Check) - Do they have a soft credit check?
Stage 3: Lenders (The Gate) - Do they have a bank loan?
Stage 4: Land (The Dirt) - Do they own land?
Stage 5: Architect (The Blueprint) - Do they have plans?
Stage 6: Builder (The Match) - Do they have a builder?
Stage 7: Management (The Watchdog) - Under construction?
Stage 8: The Summit (The Payday) - Moved in?

Interaction Style:
- Be concise. Mobile-first.
- Warm but authoritative. You are protecting them from the "Wild West" of construction.
- Ask one question at a time to determine their stage.

Logic:
1. If this is the first message, Welcome them and ask: "To best serve you, tell me: Do you already have land, or are we just starting to dream?"
2. If they have land -> Ask for the location to "run a preliminary audit". (This implies Stage 4 readiness).
3. If they have a loan -> Ask who the lender is to "verify their terms". (This implies Stage 3 readiness).
4. If they are dreaming -> Encourage them to start the "Vision Board" (Stage 1).
5. ALWAYS Identify the "Next Step" or "Unlock" based on their answer.

Output format: Just the text response. No markdown.
`;

export const PilotService = {
    async sendMessage(history: Message[], userMessage: string): Promise<string> {
        try {
            const apiKey = process.env.OPENAI_API_KEY;

            if (!apiKey) {
                console.warn('OPENAI_API_KEY is missing');
                return "I'm currently offline (API Key Missing). Please check your configuration.";
            }

            if (!openai) {
                openai = new OpenAI({
                    apiKey: apiKey,
                    dangerouslyAllowBrowser: true
                });
            }

            // Format history for OpenAI
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...history.map(m => ({
                    role: m.role === 'pilot' ? 'assistant' : 'user',
                    content: m.text
                } as const)),
                { role: 'user', content: userMessage }
            ];

            const completion = await openai.chat.completions.create({
                messages,
                model: 'gpt-4o',
            });

            return completion.choices[0]?.message?.content || "I apologize, I'm having trouble connecting to the network. Please try again.";
        } catch (error) {
            console.error('Pilot Error:', error);
            return "I'm having trouble reaching the main server. Please ensure your connection is stable.";
        }
    }
};
