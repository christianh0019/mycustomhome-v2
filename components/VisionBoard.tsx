
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export const VisionBoard: React.FC = () => {
  const [visionText, setVisionText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeVision = async () => {
    if (!visionText) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a world-class architectural consultant. Analyze this home vision and provide 3 high-level insights on style, budget risks, and feasibility: "${visionText}"`,
        config: {
          systemInstruction: "Format your response as a professional architectural audit. Keep it concise, brutal, and luxury-focused. Use markdown headers.",
        }
      });
      setAnalysis(response.text || 'Analysis failed.');
    } catch (e) {
      setAnalysis('Error connecting to AI Architect. Ensure API Key is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-5xl mx-auto w-full">
      <h2 className="text-5xl font-serif mb-4">Vision Board</h2>
      <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-12">Stage 0: Getting Started & Inspiration</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-4">
            <h3 className="text-lg font-serif italic text-white/60">"Describe the soul of your home..."</h3>
            <textarea
              value={visionText}
              onChange={(e) => setVisionText(e.target.value)}
              className="w-full h-48 bg-transparent border-white/10 focus:border-white p-4 text-xs tracking-widest uppercase outline-none transition-all leading-relaxed"
              placeholder="Black marble, floor-to-ceiling glass, industrial concrete, hidden libraries, floating staircases..."
            />
            <button
              onClick={analyzeVision}
              disabled={loading}
              className="w-full py-4 bg-white text-black text-[11px] tracking-[0.3em] uppercase font-bold hover:bg-white/90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Consulting AI Architect...' : 'Run Feasibility Audit'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-white/5 border border-white/5 flex items-center justify-center group hover:border-white transition-all cursor-pointer">
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100">Upload Inspo 1</span>
            </div>
            <div className="aspect-square bg-white/5 border border-white/5 flex items-center justify-center group hover:border-white transition-all cursor-pointer">
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100">Upload Inspo 2</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/20 p-12 min-h-[500px] relative">
          <div className="absolute top-0 right-0 p-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-8">Architectural Report</span>
          {analysis ? (
            <div className="prose prose-invert text-[11px] tracking-wider leading-relaxed uppercase opacity-80 whitespace-pre-wrap">
              {analysis}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
              <div className="w-16 h-[1px] bg-white"></div>
              <p className="text-[10px] uppercase tracking-[0.3em]">Await Audit Results</p>
              <div className="w-16 h-[1px] bg-white"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
