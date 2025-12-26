
const { Client } = require('pg');
const OpenAI = require('openai');
const https = require('https');

// --- CONFIG ---
const password = encodeURIComponent('JoeShmoe3412$');
const connectionString = `postgres://postgres.nsubhodrsiyxbbjrfmhz:${password}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;

const GOOGLE_KEY = atob("QUl6YVN5QmsxMWlUbnRUVkx3c1dlZDE1cGU2UjJFbFR2RFZCMURV");
const GOOGLE_CX = "013e75e3328574069";
const OPENAI_API_KEY = atob("c2stcHJvai01LVRRZlRYTGh5WGYzcDNfbHBPTkpyN0FldTMtSmNoT2ZGenpXTVlibEM3a0xaT0hVSEZneDVQYXJqdFlCVGR3YjJlUEdOMjRWZVQzQmxia0ZKMVFnbnBVVEZJS1NmQ0Y3OXljSW5lajhyYnpQd1BORFl4eTF4dzdONF9BdDd2c3dKdG9NLUNQM1FVWWVSZ1BBVnRabVlDVDRQQUE=");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { resolve({}); } });
        }).on('error', reject);
    });
}

async function searchGoogle(query) {
    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
        const data = await httpsGet(url);
        if (!data.items) return "";
        return data.items.map(item => `[Source: ${item.displayLink}]\nTitle: ${item.title}\nSnippet: ${item.snippet}`).join('\n\n');
    } catch (e) { return ""; }
}

async function run() {
    try {
        await client.connect();
        const res = await client.query("SELECT * FROM public.recommendations");

        console.log(`Auditing ${res.rows.length} vendors...`);

        for (const vendor of res.rows) {
            console.log(`\n==================================================`);
            console.log(`TARGET: ${vendor.name} (${vendor.city || 'National'})`);

            // 1. BBB SEARCH (Strict)
            // If we already found it, maybe skip? But let's verify.
            let bbbData = { rating: vendor.bbb_rating, years: vendor.years_in_business };

            if (!bbbData.rating) {
                const bbbQuery = `site:bbb.org "${vendor.name}" "${vendor.city || ''}"`;
                console.log(`  🔎 BBB Check: ${bbbQuery}`);
                const bbbSnippets = await searchGoogle(bbbQuery);
                if (bbbSnippets) {
                    const bbbCompletion = await openai.chat.completions.create({
                        messages: [{
                            role: 'system', content: `
                            Review snippets for "${vendor.name}". Goal: Extract exact BBB Rating (A+, A, B) and Years in Business.
                            ${bbbSnippets}
                            Return JSON: { "bbb_rating": "A+" or null, "years": "25 Years" or null }
                        `}],
                        model: 'gpt-4o',
                        response_format: { type: "json_object" }
                    });
                    const parsed = JSON.parse(bbbCompletion.choices[0].message.content);
                    if (parsed.bbb_rating) bbbData = parsed;
                    console.log(`     -> BBB Found: ${bbbData.rating} | ${bbbData.years}`);
                }
            }

            // 2. GOOGLE REVIEWS SEARCH (Cascading Strategy)
            let googleData = { rating: 0, count: 0, source: 'None' };

            // Strategy A: Strict Google
            let googleQuery = `"${vendor.name}" "${vendor.city || ''}" reviews`;
            let googleSnippets = await searchGoogle(googleQuery);

            // Strategy B: Broad Google (if A failed)
            if (!googleSnippets || googleSnippets.length < 50) {
                googleQuery = `${vendor.name} ${vendor.city || ''} mortgage reviews`;
                console.log(`  ⚠️ Fallback to Broad Query: ${googleQuery}`);
                googleSnippets = await searchGoogle(googleQuery);
            }

            // Strategy C: Trusted Authority (if others look weak)
            // Lenders often live on Zillow/LendingTree
            if (vendor.category === 'Lender') {
                const zillowQuery = `${vendor.name} reviews site:zillow.com OR site:lendingtree.com`;
                console.log(`  ⚠️ Fallback to Zillow/LendingTree: ${zillowQuery}`);
                const zillowSnippets = await searchGoogle(zillowQuery);
                googleSnippets = (googleSnippets || "") + "\n\n" + (zillowSnippets || "");
            }

            if (googleSnippets) {
                const googleCompletion = await openai.chat.completions.create({
                    messages: [{
                        role: 'system', content: `
                        Review these search results for "${vendor.name}".
                        ${googleSnippets}
                        
                        Goal: Find a NUMERIC Star Rating.
                        Hierarchy of Trust:
                        1. Google Knowledge Graph ("Rating: 4.8 · ‎120 votes")
                        2. Zillow / LendingTree (for Lenders)
                        3. Houzz / BuildZoom (for Builders)
                        4. Facebook / Yelp (Last resort)

                        Return JSON: { "rating": number, "count": number, "source": "Google" or "Zillow" etc }
                    `}],
                    model: 'gpt-4o',
                    response_format: { type: "json_object" }
                });
                const parsed = JSON.parse(googleCompletion.choices[0].message.content);
                googleData = parsed;
                console.log(`     -> Reviews Found: ${googleData.rating}/5 (${googleData.count}) via ${googleData.source}`);
            }

            // Update DB
            await client.query(`
                UPDATE public.recommendations 
                SET bbb_rating = $1, years_in_business = $2, rating = $3, review_count = $4
                WHERE id = $5
            `, [bbbData.rating || bbbData.bbb_rating, bbbData.years, googleData.rating || 0, googleData.count || 0, vendor.id]);
        }

    } catch (e) { console.error(e); }
    finally { await client.end(); }
}

run();
