
export enum AppTab {
  ProjectPilot = 'Your Helper',
  Roadmap = 'The Map',
  TheVault = 'The Safe Box',
  Partners = 'The Team',
  Messages = 'Chatting',
  KnowledgeBase = 'The Library',
  Settings = 'Profile',
  EquityClub = 'The Treasure Chest',
}

export type UserRole = 'homeowner' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string; // User biography/status
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

// Vendor Connection Types
export type LeadStatus = 'draft' | 'vetting' | 'active' | 'matched' | 'closed';
export type InviteStatus = 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface Lead {
  id: string;
  homeowner_id: string;
  created_at: string;
  status: LeadStatus;
  project_title: string;
  budget_range: string;
  location_city: string;
  location_state: string;
  scope_summary: string;
  timeline: string;
}

export interface VendorInvite {
  id: string;
  lead_id: string;
  lead?: Lead; // Joined
  vendor_email: string;
  token: string;
  status: InviteStatus;
  created_at: string;
  expires_at: string;
  viewed_at?: string;
  accepted_at?: string;
}
