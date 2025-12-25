
import React from 'react';

interface StageGaugeProps {
  score: number;
  label: string;
}

export const StageGauge: React.FC<StageGaugeProps> = ({ score, label }) => {
  const min = 300;
  const max = 850;
  const percentage = ((score - min) / (max - min)) * 100;
  const strokeDasharray = 251.2; // 2 * PI * r (r=40)
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-36 h-36 transform -rotate-90">
        <circle
          cx="72"
          cy="72"
          r="50"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1.5"
          fill="transparent"
        />
        <circle
          cx="72"
          cy="72"
          r="50"
          stroke="white"
          strokeWidth="1.5"
          fill="transparent"
          strokeDasharray={314}
          strokeDashoffset={314 - (percentage / 100) * 314}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-serif tracking-tighter">{score}</span>
        <span className="text-[8px] uppercase tracking-[0.4em] text-white/30 mt-1">{label}</span>
      </div>
    </div>
  );
};
