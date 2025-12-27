
export enum AppTab {
  ProjectPilot = 'Your Helper',
  Roadmap = 'The Map',
  TheVault = 'The Safe Box',
  Partners = 'The Team',
  Messages = 'Chatting',
  KnowledgeBase = 'The Library',
  Settings = 'Profile',
  EquityClub = 'The Treasure Chest',
  TheLedger = 'The Ledger',
}

export type UserRole = 'homeowner' | 'vendor' | 'admin';

// Roadmap Gating
export interface StageProgress {
  completed_tasks: string[];
  is_verified: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  hasOnboarded?: boolean;
  currentStage?: number;
  role?: UserRole;
  companyName?: string;
  city?: string;
  budgetRange?: string;
  phone?: string;
  lenderName?: string;
  preApprovalInfo?: string;

  // Roadmap Gating
  stage_progress?: Record<number, StageProgress>;
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
  content_warnings?: string[];
  safety_score?: number;
  bbb_rating?: string;
  years_in_business?: string;
}

// Financial / Ledger Types
export interface BudgetCategory {
  id: string;
  name: string; // e.g., "Framing", "Plumbing"
  budgeted: number;
  committed: number;
  paid: number;
}

export interface Transaction {
  id: string;
  date: string;
  vendor: string;
  description: string;
  amount: number;
  category_id: string;
  status: 'pending' | 'cleared';
  attachment_url?: string; // Link to Vault
}

export interface LedgerSummary {
  total_loan: number;
  total_budgeted: number;
  total_committed: number;
  total_paid: number;
  cash_on_hand: number;
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

export interface VaultItem {
  id: string;
  user_id: string;
  file_path: string;
  original_name: string;
  smart_name?: string;
  summary?: string;
  category: string;
  tags?: string[];
  status: 'analyzing' | 'ready' | 'error';
  ai_analysis?: {
    summary: string;
    breakdown: string[];
    red_flags: Array<{
      clause: string;
      danger_level: number; // 1-10
      explanation: string;
    }>;
    safety_score: number; // 0-100
  };
  created_at: string;
  file_size?: number;
  file_type?: string;
}
