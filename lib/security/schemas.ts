import { z } from "zod";

export const EventTypeSchema = z.enum(["wedding", "birthday", "community"]);
export const TaskPrioritySchema = z.enum(["high", "medium", "low"]);
export const VendorStatusSchema = z.enum(["to_contact", "contacted", "booked"]);
export const IdeaCategorySchema = z.enum(["theme", "decor", "menu", "entertainment", "return_gifts"]);

export const PlanGenerationRequestSchema = z.object({
  type: EventTypeSchema,
  name: z.string().trim().min(2, "Event name must be at least 2 characters").max(100, "Event name is too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)"),
  city: z.string().trim().min(2, "City name must be at least 2 characters").max(60, "City name is too long"),
  guestCount: z.coerce.number().int().min(5, "Minimum 5 guests required").max(10000, "Maximum 10,000 guests supported"),
  totalBudget: z.coerce.number().min(5000, "Minimum budget is ₹5,000").max(500000000, "Maximum budget is ₹50 Crore"),
  vibe: z.array(z.string().trim().max(50)).min(1, "Select at least one vibe").max(10),
  dietaryPreferences: z.array(z.string().trim().max(60)).max(10).default([]),
  culturalTraditions: z.array(z.string().trim().max(80)).max(10).default([]),
  notes: z.string().trim().max(1000).optional().default(""),
});

export const BudgetCategoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(80),
  allocatedPercent: z.number().min(0).max(100),
  allocatedAmount: z.number().min(0),
  spentAmount: z.number().min(0).default(0),
  notes: z.string().max(300).optional(),
});

export const TimelineTaskItemSchema = z.object({
  id: z.string().optional(),
  phase: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(""),
  dueOffsetDays: z.number().int().min(0).max(730),
  dueDate: z.string().optional(),
  priority: TaskPrioritySchema.default("medium"),
  completed: z.boolean().default(false),
  category: z.string().trim().max(60).default("General"),
});

export const VendorItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(60),
  status: VendorStatusSchema.default("to_contact"),
  contactPerson: z.string().max(80).optional(),
  phone: z.string().max(25).optional(),
  email: z.string().email().optional().or(z.literal("")),
  quotedPrice: z.number().min(0).default(0),
  estimatedRange: z.string().trim().max(60).default(""),
  suggestedBudget: z.number().min(0).optional(),
  notes: z.string().max(500).default(""),
  questionsToAsk: z.array(z.string().trim().max(200)).default([]),
});

export const IdeaItemSchema = z.object({
  id: z.string().optional(),
  category: IdeaCategorySchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  culturalTouch: z.string().trim().max(200).optional(),
  saved: z.boolean().default(false),
});

export const PlanGenerationResponseSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().trim().min(1).max(80),
      allocatedPercent: z.number().min(0).max(100),
      allocatedAmount: z.number().min(0),
      notes: z.string().max(300).optional(),
    }),
  ).min(3),
  timeline: z.array(
    z.object({
      phase: z.string().trim().min(1).max(60),
      title: z.string().trim().min(1).max(120),
      description: z.string().trim().max(500),
      dueOffsetDays: z.number().int().min(0).max(730),
      priority: TaskPrioritySchema,
      category: z.string().trim().max(60),
    }),
  ).min(4),
  vendors: z.array(
    z.object({
      name: z.string().trim().min(1).max(100),
      category: z.string().trim().min(1).max(60),
      estimatedRange: z.string().trim().max(60),
      suggestedBudget: z.number().min(0),
      notes: z.string().max(500),
      questionsToAsk: z.array(z.string().trim().max(200)),
    }),
  ).min(3),
  ideas: z.array(
    z.object({
      category: IdeaCategorySchema,
      title: z.string().trim().min(1).max(120),
      description: z.string().trim().max(600),
      culturalTouch: z.string().trim().max(200).optional(),
    }),
  ).min(5),
});

export const RebalanceRequestSchema = z.object({
  totalBudget: z.coerce.number().min(5000).max(500000000),
  guestCount: z.coerce.number().int().min(1).max(10000),
  categories: z.array(
    z.object({
      id: z.string().default(""),
      name: z.string().trim().min(1),
      allocatedPercent: z.number().min(0).max(100),
      allocatedAmount: z.number().min(0),
      spentAmount: z.number().min(0),
    }),
  ).min(1),
});

export const RebalanceResponseSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().trim().min(1),
      allocatedPercent: z.number().min(0).max(100),
      allocatedAmount: z.number().min(0),
      adjustmentReason: z.string().trim().min(1).max(300),
    }),
  ),
  summary: z.string().trim().min(1).max(500),
});

export const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message exceeds 1000 characters"),
  context: z.object({
    eventName: z.string().optional(),
    eventType: EventTypeSchema.optional(),
    city: z.string().optional(),
    guestCount: z.number().optional(),
    totalBudget: z.number().optional(),
    vibe: z.array(z.string()).optional(),
  }).optional(),
});

