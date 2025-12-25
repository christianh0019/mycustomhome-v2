
export enum AppTab {
  ProjectPilot = 'Your Helper',
  Roadmap = 'The Map',
  TheVault = 'The Safe Box',
  Partners = 'The Team',
  Messages = 'Chatting',
  EquityClub = 'The Treasure Chest',
}

export interface Message {
  id: string;
  role: 'pilot' | 'user' | 'partner';
  senderName?: string;
  text: string;
  timestamp: string;
  isFlagged?: boolean;
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  transparencyScore: number;
  status: 'Vetted' | 'Active Bid' | 'Partner';
  history: string;
}

export interface AuditMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  risk: 'low' | 'medium' | 'high';
  riskDetail?: string;
}
