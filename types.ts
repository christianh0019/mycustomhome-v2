
export enum AppTab {
  ProjectPilot = 'Your Helper',
  Roadmap = 'The Map',
  TheVault = 'The Safe Box',
  Partners = 'The Team',
  Messages = 'Chatting',
  EquityClub = 'The Treasure Chest',
  KnowledgeBase = 'The Library',
  Settings = 'Profile',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string; // Optional URL for profile picture
  hasOnboarded?: boolean;
  currentStage?: number;
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
