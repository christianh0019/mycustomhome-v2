
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

export type UserRole = 'homeowner' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string; // Optional URL for profile picture
  hasOnboarded?: boolean;
  currentStage?: number;
  role?: UserRole;
  companyName?: string;
  city?: string;
  budgetRange?: string;
  phone?: string;
  lenderName?: string;
  preApprovalInfo?: string;
}

export interface Recommendation {
  id: string;
  category: string;
  name: string;
  description: string;
  scores: {
    reputation: number;
    affordability: number;
    locality: number;
  };
  status: 'new' | 'viewed' | 'contacted';
  logo_url?: string;
  website?: string;
  phone?: string;
  reviews_summary?: string;
  verified_badge?: boolean;
  rating?: number;
  review_count?: number;
  overall_score?: number;
  bbb_rating?: string;
  years_in_business?: string;
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

export interface Lead {
  id: string;
  homeowner_id: string;
  vendor_id?: string;
  status: 'pending' | 'invite_sent' | 'accepted' | 'declined' | 'invoiced';
  commission_rate: number;
  project_scope_snapshot?: any;
  created_at: string;
}

export interface VendorInvite {
  id: string;
  lead_id: string;
  token: string;
  email_sent_to: string;
  expires_at: string;
}
