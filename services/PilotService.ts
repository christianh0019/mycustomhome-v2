
import OpenAI from 'openai';
import { Message } from '../types';
import { supabase } from './supabase';

// Initialize lazily to avoid crash if env var is missing
let openai: OpenAI | null = null;

const SYSTEM_PROMPT = `
You are the "Project Pilot" for MyCustomHome, an elite, fiduciary Custom Home Agency.
Your Role: A warm, professional, and protective guide (The "Sorting Hat").
Your Goal: Assess the user's journey (The "9 Stages") and analyze any visual inputs they provide.

The 9 Stages:
Stage 0: Onboarding (You are here)
Stage 1: Vision - Do they know what they want?
Stage 2: Pre-Approval - Soft credit check?
Stage 3: Lenders - Bank loan?
Stage 4: Land - Own land?
Stage 5: Architect - Plans?
Stage 6: Builder - Builder?
Stage 7: Management - Construction?
Stage 8: The Summit - Move in?

Interaction Style:
- Be concise. Mobile-first.
- Warm but authoritative.
- **Vision Capable**: If the user sends an image, analyze it for architectural style, land terrain, or document details.

LOGIC TREE (Follow strictly):
1. **First Interaction**: "Welcome to MyCustomHome. I am your Project Pilot. To serve you best, do you currently OWN the land you want to build on?"
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
            text: row.content,
            timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
    },

    async sendMessage(history: Message[], userMessage: string, userId?: string): Promise<string> {
        try {
            // 1. Config & API Key
            let apiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
                const encoded = import.meta.env.VITE_OPENAI_ENCODED || process.env.VITE_OPENAI_ENCODED;
                if (encoded) try { apiKey = atob(encoded); } catch (e) { console.error(e); }
            }
            if (!apiKey) return "I'm currently offline (API Key Missing).";

            if (!openai) openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

            // 2. Save User Message (Raw Text with [Attachment] tag)
            if (userId) {
                await supabase.from('chat_messages').insert({
                    user_id: userId, role: 'user', content: userMessage
                });
            }

            // 3. Helper to format content for GPT-4 Vision
            const formatContent = (text: string): any[] | string => {
                const attachMatch = text.match(/\[Attachment: .*?\]\((.*?)\)/);
                if (attachMatch) {
                    const url = attachMatch[1];
                    const cleanText = text.replace(attachMatch[0], '').trim();

                    // Simple extension check to see if it's an image
                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

                    if (isImage) {
                        return [
                            { type: "text", text: cleanText || "Analyze this image." },
                            { type: "image_url", image_url: { url: url } }
                        ];
                    }
                    // PDFs/Docs: AI can't read directly yet via standard vision, treat as text link context
                    return text;
                }
                return text;
            };

            // 4. Construct Payload
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: 'system', content: SYSTEM_PROMPT },
                ...history.map(m => ({
                    role: m.role === 'pilot' ? 'assistant' : 'user',
                    content: formatContent(m.text)
                } as any)), // Cast to 'any' to handle the complex content union type
                { role: 'user', content: formatContent(userMessage) as any }
            ];

            // 5. Call OpenAI
            const completion = await openai.chat.completions.create({
                messages,
                model: 'gpt-4o', // Vision enabled model
            });

            const rawResponse = completion.choices[0]?.message?.content || "I apologize, I'm having trouble connecting.";

            // 6. Handle Stage Logic
            let cleanResponse = rawResponse;
            const stageMatch = rawResponse.match(/\[STAGE_(\d+)\]/);

            if (stageMatch && userId) {
                const newStage = parseInt(stageMatch[1]);
                await supabase.from('profiles').update({ current_stage: newStage }).eq('id', userId);
                cleanResponse = rawResponse.replace(/\[STAGE_\d+\]/, '').trim();
            }

            // 7. Save and Return
            if (userId) {
                await supabase.from('chat_messages').insert({
                    user_id: userId, role: 'pilot', content: cleanResponse
                });
            }

            return cleanResponse;

        } catch (error) {
            console.error('Pilot Error:', error);
            return "network error";
        }
    },

    async generateVendorRecommendations(userId: string, category: string, city: string, budget: string, existingNames: string[] = []): Promise<void> {
        try {
            // 1. Config
            let apiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
                const encoded = import.meta.env.VITE_OPENAI_ENCODED || process.env.VITE_OPENAI_ENCODED;
                if (encoded) try { apiKey = atob(encoded); } catch (e) { console.error(e); }
            }
            if (!apiKey || !openai) {
                if (apiKey) openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
                else return;
            }

            // 2. Prompt for Research
            const prompt = `
                Act as a luxury custom home consultant in ${city}.
                Recommend 3 real, high-reputation ${category}s suitable for a project budget of ${budget}.
                
                IMPORTANT: Do NOT recommend these companies: ${existingNames.join(', ')}.

                You MUST return a JSON object with a single key "vendors" containing an array of objects.
                Response Format:
                {
                    "vendors": [
                        {
                            "name": "Company Name",
                            "description": "1 sentence on why they fit this budget/area.",
                            "scores": { "reputation": 0-100, "affordability": 0-100, "locality": 0-100 }
                        }
                    ]
                }
            `;

            const completion = await openai!.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: 'gpt-4o',
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("Empty response from AI");

            // 3. Parse and Save
            const data = JSON.parse(content);
            const recommendations = data.vendors;

            if (!Array.isArray(recommendations) || recommendations.length === 0) {
                console.warn("AI returned no vendors:", data);
                return; // Or throw, but UI handles empty via re-fetch
            }

            const rows = recommendations.map((rec: any) => ({
                user_id: userId,
                category: category,
                name: rec.name,
                description: rec.description,
                scores: rec.scores,
                status: 'new',
                logo_url: `https://ui-avatars.com/api/?name=${rec.name}&background=random`
            }));

            if (rows.length > 0) {
                // Use upsert to handle unique constraint violation gracefully
                const { error } = await supabase.from('recommendations')
                    .upsert(rows, { onConflict: 'user_id, name', ignoreDuplicates: true });

                if (error) console.error('Supabase Insert Error:', error);
            }

        } catch (e) {
            console.error('AI Research Failed:', e);
            throw e; // Propagate to UI
        }
    },

    async enrichVendorData(vendor: any): Promise<void> {
        try {
            let apiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
                const encoded = import.meta.env.VITE_OPENAI_ENCODED || process.env.VITE_OPENAI_ENCODED;
                if (encoded) try { apiKey = atob(encoded); } catch (e) { console.error(e); }
            }
            if (!apiKey || !openai) {
                if (apiKey) openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
                else return;
            }

            const prompt = `
                Research the company "${vendor.name}" (a ${vendor.category}) in or near ${vendor.city || 'local area'}.
                Find their website, phone number, and summarize their online reputation (reviews from Google, Houzz, etc).

                Return JSON:
                {
                    "website": "url or empty",
                    "phone": "number or empty",
                    "reviews_summary": "2-3 sentences summarizing their reputation. Be honest about pros/cons.",
                    "verified": true (if you found real data)
                }
            `;

            const completion = await openai!.chat.completions.create({
                messages: [{ role: 'system', content: prompt }],
                model: 'gpt-4o',
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) return;

            const data = JSON.parse(content);

            await supabase.from('recommendations').update({
                website: data.website,
                phone: data.phone,
                reviews_summary: data.reviews_summary,
                verified_badge: data.verified
            }).eq('id', vendor.id);

        } catch (e) {
            console.error('Enrichment Failed:', e);
        }
    }
};
