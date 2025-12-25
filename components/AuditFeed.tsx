
import React from 'react';
import { AuditMessage } from '../types';

const MOCK_MESSAGES: AuditMessage[] = [
  {
    id: '1',
    sender: 'Precision Builders LLC',
    message: "Requested a 15% increase in site preparation fee due to 'unforeseen rock' without geological report.",
    timestamp: '2h ago',
    risk: 'high',
    riskDetail: 'MISSING DOCUMENTATION DETECTED'
  },
  {
    id: '2',
    sender: 'Arch-Point Designs',
    message: "Updated plan review for window frames. Switch from triple-pane to double-pane proposed.",
    timestamp: '5h ago',
    risk: 'medium',
    riskDetail: 'EFFICIENCY DOWNGRADE'
  },
  {
    id: '3',
    sender: 'Lead Realtor',
    message: "Lot 44B confirmed with utility easements matched to your 10-year vision.",
    timestamp: '1d ago',
    risk: 'low'
  }
];

interface AuditFeedProps {
  limit?: number;
}

export const AuditFeed: React.FC<AuditFeedProps> = ({ limit }) => {
  const display = limit ? MOCK_MESSAGES.slice(0, limit) : MOCK_MESSAGES;

  return (
    <div className="space-y-6">
      {display.map((msg) => (
        <div key={msg.id} className="border-l-2 border-white/5 pl-4 py-1">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[9px] uppercase tracking-widest text-white/60">{msg.sender}</span>
            <span className="text-[8px] text-white/20 uppercase">{msg.timestamp}</span>
          </div>
          <p className="text-[11px] leading-tight text-white/90">
            {msg.message}
          </p>
          {msg.risk !== 'low' && (
            <div className={`mt-2 text-[8px] uppercase tracking-[0.2em] font-bold ${
              msg.risk === 'high' ? 'text-red-500' : 'text-yellow-500'
            }`}>
              AI AUDIT: {msg.riskDetail || 'FLAGGED FOR REVIEW'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
