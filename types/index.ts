export type EventType = "wedding" | "birthday" | "community";

export type TaskPriority = "high" | "medium" | "low";

export type VendorStatus = "to_contact" | "contacted" | "booked";

export type IdeaCategory = "theme" | "decor" | "menu" | "entertainment" | "return_gifts";

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedPercent: number;
  allocatedAmount: number;
  spentAmount: number;
  notes?: string;
}

export interface TimelineTask {
  id: string;
  phase: string;
  title: string;
  description: string;
  dueOffsetDays: number; // Days before event (e.g. 60 = 60 days before event date)
  dueDate: string; // ISO date string computed from event date
  priority: TaskPriority;
  completed: boolean;
  category: string;
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  status: VendorStatus;
  contactPerson?: string;
  phone?: string;
  email?: string;
  quotedPrice: number;
  estimatedRange: string;
  notes: string;
  questionsToAsk: string[];
}

export interface IdeaItem {
  id: string;
  category: IdeaCategory;
  title: string;
  description: string;
  culturalTouch?: string;
  saved: boolean;
}

export interface GuestSummary {
  invited: number;
  confirmed: number;
  declined: number;
}

export interface EventPlan {
  id: string;
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  city: string;
  guestCount: number;
  totalBudget: number; // in INR
  vibe: string[];
  dietaryPreferences: string[];
  culturalTraditions: string[];
  notes: string;
  categories: BudgetCategory[];
  timeline: TimelineTask[];
  vendors: VendorItem[];
  ideas: IdeaItem[];
  guests: GuestSummary;
  createdAt: string;
  updatedAt: string;
}

export interface PlanGenerationRequest {
  type: EventType;
  name: string;
  date: string;
  city: string;
  guestCount: number;
  totalBudget: number;
  vibe: string[];
  dietaryPreferences: string[];
  culturalTraditions: string[];
  notes?: string;
}

export interface PlanGenerationResponse {
  categories: Array<{
    name: string;
    allocatedPercent: number;
    allocatedAmount: number;
    notes?: string;
  }>;
  timeline: Array<{
    phase: string;
    title: string;
    description: string;
    dueOffsetDays: number;
    priority: TaskPriority;
    category: string;
  }>;
  vendors: Array<{
    name: string;
    category: string;
    estimatedRange: string;
    suggestedBudget: number;
    notes: string;
    questionsToAsk: string[];
  }>;
  ideas: Array<{
    category: IdeaCategory;
    title: string;
    description: string;
    culturalTouch?: string;
  }>;
  aiProviderUsed?: "gemini" | "anthropic" | "demo";
}

export interface RebalanceRequest {
  totalBudget: number;
  guestCount: number;
  categories: Array<{
    id: string;
    name: string;
    allocatedPercent: number;
    allocatedAmount: number;
    spentAmount: number;
  }>;
}

export interface RebalanceResponse {
  categories: Array<{
    id?: string;
    name: string;
    allocatedPercent: number;
    allocatedAmount: number;
    adjustmentReason: string;
  }>;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  suggestedActions?: Array<{
    label: string;
    prompt: string;
  }>;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  reduceMotion: boolean;
  currencyFormat: "lakhs" | "standard";
}
