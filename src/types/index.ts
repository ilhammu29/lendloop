export type ToolCategory =
  | "power tools"
  | "garden"
  | "kitchen"
  | "camping"
  | "woodworking"
  | "automotive"
  | "other";

export type ToolCondition = "new" | "like-new" | "good" | "fair";

export type ToolStatus = "available" | "borrowed";

export type LoanStatus = "pending" | "approved" | "declined" | "returned";

export type UserRole = "admin" | "user";

export interface PublicTool {
  _id: string;
  name: string;
  category: ToolCategory;
  imageUrl?: string;
  status: ToolStatus;
}

export interface ToolItem {
  _id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: ToolCategory;
  condition: ToolCondition;
  description: string;
  imageUrl?: string;
  status: ToolStatus;
  isTrustedLender?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface LoanItem {
  _id: string;
  toolId: string;
  toolName: string;
  lenderId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  lastReminderSentAt?: number;
  reminderCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface AutomationLogItem {
  _id: string;
  loanId: string;
  workflowType: "request_notification" | "overdue_reminder";
  status: "sent" | "failed";
  idempotencyKey: string;
  payloadSummary: string;
  sentAt: number;
}
