export interface User {
  id: string;
  name: string;
  role: string;
  skills: string[];
  max_capacity: number;
  allocated_hours: number;
  created_at?: string;
}

export interface ProcurementTask {
  id: string;
  title: string;
  required_skill: string;
  estimated_hours: number;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  assigned_to?: string;
  created_at?: string;
}

export interface AssignmentLog {
  id: string;
  task_id: string;
  employee_id: string;
  score: number;
  reasoning: string;
  created_at?: string;
}

export interface AssignmentResult {
  assignedTo: string; // Employee Name
  score: number;
  reasoning: string;
}
export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  current_stock: number;
  min_threshold: number;
  unit_price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Vendor {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  reliability_score: number;
  average_lead_time_days: number;
}

export interface InventoryPrediction {
  inventory_id: string;
  item_name: string;
  category: string;
  current_stock: number;
  min_threshold: number;
  average_daily_consumption: number;
  days_until_depletion: number;
  predicted_depletion_date: Date;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  recommended_action: string;
}

export interface BudgetInfo {
  id: string;
  category: string;
  monthly_limit: number;
  current_spend: number;
  remaining_budget: number;
  utilization_percentage: number;
  period_start: string;
  period_end: string;
}

export interface ApprovalRequest {
  id: string;
  purchase_order_id?: string;
  task_id?: string;
  request_type: string;
  amount: number;
  status: string;
  current_approver_level: number;
  max_approval_level: number;
  comments?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  metadata: any;
  created_at: string;
  read_at: string | null;
}

export interface PurchaseOrder {
  id: string;
  task_id: string | null;
  vendor_id: string;
  inventory_id: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Ordered' | 'Delivered' | 'Cancelled';
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  items: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
}