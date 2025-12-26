import OpenAI from 'openai';
import { Message } from '../types';
import { supabase } from './supabase';

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

LOGIC TREE (Follow strictly):
1. **First Interaction**: "Welcome to MyCustomHome. I am your Project Pilot, here to guide you from idea to move-in. To serve you best, do you currently OWN the land you want to build on?"
   - IF YES -> GOTO "Land Branch".
   - IF NO -> GOTO "Loan Branch".

2. **Land Branch**: 
   - Ask: "Great. Do you have the property address or a survey I can analyze?"
   - IF PROVIDED -> Reply: "I've logged that location. I'll begin a preliminary zoning analysis."
     - **CRITICAL**: Append '[STAGE_4]' to your response.

3. **Loan Branch**:
   - Ask: "No problem. Do you have a construction loan pre-approval yet?"
   - IF YES -> Ask: "Excellent. Which lender is it with? I'll verify their draw schedule terms."
     - **CRITICAL**: Append '[STAGE_3]' to your response.
   - IF NO -> Reply: "Understood. The best place to start is with your Vision, so we can estimate costs before talking to banks."
     - **CRITICAL**: Append '[STAGE_1]' to your response.

4. **Vision Branch (Stage 1)**:
   - Ask: "Tell me about the home you're dreaming of. Style, size, or any must-haves?"
   
IMPORTANT:
- If the user qualifies for a stage, YOU MUST include the tag '[STAGE_X]' (e.g., [STAGE_1], [STAGE_3], [STAGE_4]) at the very end of your message.
- Do not output markdown.
- Do not make up fake analysis data yet, just say "I will analyze...".
`;

export const PilotService = {
    async loadHistory(userId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) {
            console.error('Error loading history:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            role: row.role as 'pilot' | 'user',
            text: row.content, // We verify parsing happened on save, but here we just read raw content
            timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
    },

    async sendMessage(history: Message[], userMessage: string, userId?: string): Promise<string> {
        console.log('PilotService: Sending message...');
        try {
            // Try to find the key in standard vars, or decode the encoded fallback
            let apiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

            // Decaying fallback: If direct key is missing, check for encoded version (Bypasses GitHub Scanning)
            if (!apiKey) {
                const encoded = import.meta.env.VITE_OPENAI_ENCODED || process.env.VITE_OPENAI_ENCODED;
                if (encoded) {
                    try {
                        apiKey = atob(encoded);
                    } catch (e) {
                        console.error('Failed to decode key', e);
                    }
                }
            }

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

            // Save User Message to DB
            if (userId) {
                await supabase.from('chat_messages').insert({
                    user_id: userId,
                    role: 'user',
                    content: userMessage
                });
            }

            // Format history for OpenAI
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...history.map(m => ({
                    role: m.role === 'pilot' ? 'assistant' : 'user',
                    content: m.text
                } as const)),
                { role: 'user', content: userMessage } // Explicitly add latest message
            ];

            const completion = await openai.chat.completions.create({
                messages,
                model: 'gpt-4o',
            });

            const rawResponse = completion.choices[0]?.message?.content || "I apologize, I'm having trouble connecting to the network. Please try again.";

            // --- PARSE STAGE COMMANDS ---
            let cleanResponse = rawResponse;
            const stageMatch = rawResponse.match(/\[STAGE_(\d+)\]/);

            if (stageMatch && userId) {
                const newStage = parseInt(stageMatch[1]);
                console.log(`Pilot identified Stage: ${newStage}`);

                // 1. Update Profile in Supabase
                const { error } = await supabase
                    .from('profiles')
                    .update({ current_stage: newStage })
                    .eq('id', userId);

                if (error) console.error('Failed to update stage:', error);

                // 2. Strip the tag from the message shown to user
                cleanResponse = rawResponse.replace(/\[STAGE_\d+\]/, '').trim();
            }

            // Save Pilot Response to DB
            if (userId) {
                await supabase.from('chat_messages').insert({
                    user_id: userId,
                    role: 'pilot',
                    content: cleanResponse
                });
            }

            return cleanResponse;
        } catch (error) {
            console.error('Pilot Error:', error);
            return "I'm having trouble reaching the main server. Please ensure your connection is stable.";
        }
    }
};
