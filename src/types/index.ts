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
