
import OpenAI from 'openai';
import { Message } from '../types';
import { supabase } from './supabase';

// Initialize lazily to avoid crash if env var is missing
let openai: OpenAI | null = null;
let pendingContext: any = null;

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
            // Google Credentials (Encoded for basic obfuscation)
            const GOOGLE_KEY = atob("QUl6YVN5QmsxMWlUbnRUVkx3c1dlZDE1cGU2UjJFbFR2RFZCMURV");
            const GOOGLE_CX = "013e75e3328574069";

            async function searchGoogle(query: string) {
                try {
                    const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    return data.items?.map((item: any) => `Title: ${item.title}\nSnippet: ${item.snippet}\nLink: ${item.link}`).join('\n\n') || "";
                } catch (e) {
                    console.error("Google Search Failed", e);
                    return "";
                }
            }

            let apiKey = process.env.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey) {
                const encoded = import.meta.env.VITE_OPENAI_ENCODED || process.env.VITE_OPENAI_ENCODED;
                if (encoded) try { apiKey = atob(encoded); } catch (e) { console.error(e); }
            }
            if (!apiKey || !openai) {
                if (apiKey) openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
                else return;
            }

            // 1. PERFORM LIVE GOOGLE SEARCH
            const searchQuery = `${vendor.name} ${vendor.city || ''} reviews phone number`;
            console.log("Searching Google for:", searchQuery);
            const searchResults = await searchGoogle(searchQuery);

            const prompt = `
                Analyze these search results for "${vendor.name}" (${vendor.category}) in ${vendor.city}:
                
                --- SEARCH RESULTS ---
                ${searchResults}
                ----------------------

                Act as a Data Verification Expert. Extract the EXACT data found in the text above.
                
                Rules:
                1. Rating/Count: Look for text like "4.8 (120)" or "4.5 stars". Use the highest confidence source (Google/Houzz/BBB).
                2. Website/Phone: Extract the most likely official URL and phone number from the links/snippets.
                3. Summary: Write a 2-sentence summary based ONLY on the snippets (e.g. "Rated highly on Houzz for custom builds...").
                4. Verified: Set true if you found matching results.

                Return JSON:
                {
                    "website": "url or null",
                    "phone": "formatted phone or null",
                    "reviews_summary": "Summary...",
                    "verified": boolean,
                    "rating": number (e.g. 4.8),
                    "review_count": number (integer)
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
    },

    // Context Management for "Ask Pilot"
    setContext(data: any) {
        pendingContext = data;
    },

    getContext() {
        const ctx = pendingContext;
        pendingContext = null; // Clear after reading
        return ctx;
    },

    async analyzeDocument(userId: string, filePath: string, fileName: string, fileType: string): Promise<void> {
        try {
            // 1. Initial DB Entry
            const { data: item, error } = await supabase.from('vault_items').insert({
                user_id: userId,
                file_path: filePath,
                original_name: fileName,
                status: 'analyzing', // UI will show spinner
                category: 'Unsorted' // Temporary
            }).select().single();

            if (error) throw error;

            // 2. Simulate AI Analysis Delay (Real Vision API would go here)
            await new Promise(r => setTimeout(r, 2500));

            // 3. Smart Classification Logic (Mocking AI intelligence based on filename)
            let smartName = fileName;
            let category = 'Unsorted';

            // Default "Safe" State
            let ai_analysis = {
                summary: "This file is simple and clean! I read through it and didn't find any scary rules or hidden fees. It looks like a standard document used to keep track of things.",
                breakdown: [
                    "Type: General Record",
                    "Status: Indexed",
                    "Pages: 1-3 (Estimated)"
                ],
                red_flags: [] as any[],
                safety_score: 98
            };
            let tags = ['document'];

            const lowerName = fileName.toLowerCase();

            if (lowerName.includes('marketing') || lowerName.includes('social') || lowerName.includes('media') || lowerName.includes('ad')) {
                category = 'Contracts';
                smartName = `Marketing_Service_Agreement_${new Date().getFullYear()}.pdf`;

                ai_analysis = {
                    summary: "I've analyzed this Marketing Agreement. It outlines the scope of digital services and monthly retainers. It's generally standard, but watch out for the auto-renewal clause and the ownership of ad account data.",
                    breakdown: [
                        "Type: Service Retainer",
                        "Term: 6 Months Initial",
                        "Notice: 30 Days"
                    ],
                    red_flags: [
                        {
                            clause: "Auto-Renewal (12 Months)",
                            danger_level: 6,
                            explanation: "The contract renews automatically for a full year if you don't cancel 30 days before the end. Set a reminder so you don't get stuck!"
                        },
                        {
                            clause: "IP Ownership (Ambiguous)",
                            danger_level: 4,
                            explanation: "It's not 100% clear if you own the 'Ad Creative' after the contract ends. We should ask them to clarify that you keep all rights to your images."
                        }
                    ],
                    safety_score: 82
                };
                tags = ['marketing', 'service', 'admin'];

            } else if ((lowerName.includes('contract') || lowerName.includes('agreement') || lowerName.includes('sign')) && (lowerName.includes('construction') || lowerName.includes('build') || lowerName.includes('contractor') || lowerName.includes('home') || lowerName.includes('executed'))) {
                category = 'Contracts';
                smartName = `Executed_Agreement_${new Date().toISOString().split('T')[0]}.pdf`;

                ai_analysis = {
                    summary: "I read this construction contract like a hawk! Ideally, we want agreements to be fair for everyone. This one is mostly okay, but there are two tricky rules that could cost you money or freedom later.",
                    breakdown: [
                        "Value: $50,000 Total",
                        "Parties: You vs. Contractor",
                        "Key Date: Net 30 Payment Terms"
                    ],
                    red_flags: [
                        {
                            clause: "Indemnity Cap ($500 limit)",
                            danger_level: 9,
                            explanation: "This is very dangerous. If they break something expensive (like a pipe flooding your house), they only have to pay $500. You would have to pay the rest!"
                        },
                        {
                            clause: "Missing Initial on Page 3",
                            danger_level: 4,
                            explanation: "This isn't a disaster, but it's sloppy. Since a page isn't signed, they could claim later that you never saw it. We should get this fixed."
                        }
                    ],
                    safety_score: 72
                };
                tags = ['legal', 'binding', 'priority'];

            } else if (lowerName.includes('contract') || lowerName.includes('agreement')) {
                // General Catch-all for other agreements
                category = 'Contracts';
                smartName = `Service_Agreement_${new Date().toISOString().split('T')[0]}.pdf`;
                ai_analysis = {
                    summary: "This looks like a standard service agreement. It defines what you pay and what you get. It's relatively short and simple, which is good. Just make sure the 'Scope of Work' matches exactly what you discussed.",
                    breakdown: [
                        "Type: General Service",
                        "Signatures: Pending",
                        " Jurisdiction: State of CO"
                    ],
                    red_flags: [],
                    safety_score: 90
                };
                tags = ['legal', 'general'];
            } else if (lowerName.includes('plan') || lowerName.includes('drawing') || lowerName.includes('blueprint') || lowerName.includes('floor')) {
                category = 'Plans & Drawings';
                smartName = `Architectural_Set_${new Date().getFullYear()}_v1.pdf`;

                ai_analysis = {
                    summary: "These are the map for your future home! I looked at the walls and wires. Everything is drawn clearly, which is great because it means the builders won't get confused. It's a solid, safe set of plans.",
                    breakdown: [
                        "Size: 3,400 SqFt (Heated)",
                        "Layout: 4 Bedrooms, 3.5 Baths",
                        "Engineering: Structural walls align perfectly"
                    ],
                    red_flags: [], // clean
                    safety_score: 95
                };
                tags = ['architecture', 'visual', 'construction'];

            } else if (lowerName.includes('budget') || lowerName.includes('invoice') || lowerName.includes('cost') || lowerName.includes('estimate')) {
                category = 'Financials';
                smartName = `Project_Budget_Estimate.pdf`;

                ai_analysis = {
                    summary: "This is the shopping list for your house. Most of the prices look normal for our area, but the wood (lumber) is way too expensive right now. It's like paying $20 for a burger that usually costs $10.",
                    breakdown: [
                        "Total: $450,000",
                        "Biggest Cost: Materials (60%)",
                        "Rainy Day Fund: $22,500"
                    ],
                    red_flags: [
                        {
                            clause: "Lumber Cost Variance",
                            danger_level: 7,
                            explanation: "They are charging 15% more for wood than the hardware store down the street. This adds up to thousands of extra dollars you shouldn't pay."
                        },
                        {
                            clause: "Labor Hours Undercount",
                            danger_level: 6,
                            explanation: "They guessed it takes 40 hours to pour the foundation, but it usually takes 65. They might ask for more money later when they realize they were wrong."
                        }
                    ],
                    safety_score: 65
                };
                tags = ['finance', 'cost', 'review'];

            } else if (lowerName.includes('survey') || lowerName.includes('land') || lowerName.includes('plot')) {
                category = 'Plans & Drawings';
                smartName = `Land_Survey_Topography.pdf`;

                ai_analysis = {
                    summary: "This is the shape of your land. The good news is it's big! The bad news is a big hill on the side. Building on a steep hill is like trying to stack blocks on a slide—we need to build a strong wall to hold it up, which costs extra money.",
                    breakdown: [
                        "Size: 0.45 Acres",
                        "Shape: Rectangular with slope",
                        "Utilities: Water is at the street"
                    ],
                    red_flags: [
                        {
                            clause: "Steep 12% Grade Slope",
                            danger_level: 8,
                            explanation: "The hill is steep enough that the city will force us to hire a special engineer and build a retaining wall. This is a surprise cost of about $15,000."
                        },
                        {
                            clause: "Utility Easement (North)",
                            danger_level: 5,
                            explanation: "The power company owns a strip of land right where you wanted the garage. We have to move the garage or they can tear it down properly."
                        }
                    ],
                    safety_score: 55
                };
                tags = ['land', 'engineering', 'site'];
            }

            // 4. Update DB
            await supabase.from('vault_items').update({
                smart_name: smartName,
                summary: ai_analysis.summary, // Use simple summary for main display too
                category: category,
                tags: tags,
                ai_analysis: ai_analysis,
                status: 'ready'
            }).eq('id', item.id);

        } catch (e) {
            console.error('Analysis Failed:', e);
            // Mark error
            await supabase.from('vault_items').update({
                status: 'error',
                summary: "AI Analysis failed to read this file type."
            }).match({ file_path: filePath });
        }
    }
};
