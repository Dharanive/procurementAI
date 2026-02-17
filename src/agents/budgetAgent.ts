import { supabase } from '@/lib/supabase';

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

export interface CostComparison {
  inventory_id: string;
  item_name: string;
  current_vendor_price: number;
  alternative_vendors: Array<{
    vendor_id: string;
    vendor_name: string;
    price: number;
    savings: number;
    savings_percentage: number;
  }>;
}

/**
 * Budget & Cost Optimization Agent
 * Monitors spending and suggests cost optimizations
 */
export async function getBudgetStatus(): Promise<BudgetInfo[]> {
  console.log("[Budget Agent] Fetching budget status...");

  const { data, error } = await supabase
    .from('procurement_budgets')
    .select('*')
    .gte('period_end', new Date().toISOString().split('T')[0])
    .order('category');

  if (error) {
    throw new Error(`Failed to fetch budgets: ${error.message}`);
  }

  const budgets: BudgetInfo[] = (data || []).map(budget => {
    const remaining = budget.monthly_limit - budget.current_spend;
    const utilization = budget.monthly_limit > 0
      ? (budget.current_spend / budget.monthly_limit) * 100
      : 0;

    return {
      id: budget.id,
      category: budget.category,
      monthly_limit: parseFloat(budget.monthly_limit),
      current_spend: parseFloat(budget.current_spend || 0),
      remaining_budget: remaining,
      utilization_percentage: Math.round(utilization * 100) / 100,
      period_start: budget.period_start,
      period_end: budget.period_end
    };
  });

  console.log(`[Budget Agent] Found ${budgets.length} active budgets`);
  return budgets;
}

/**
 * Check if purchase exceeds budget
 */
export async function checkBudgetLimit(
  category: string,
  amount: number
): Promise<{ allowed: boolean; remaining: number; message: string }> {
  const budgets = await getBudgetStatus();
  const budget = budgets.find(b => b.category === category);

  if (!budget) {
    return {
      allowed: true,
      remaining: Infinity,
      message: `No budget set for category: ${category}`
    };
  }

  const remaining = budget.remaining_budget;
  const allowed = remaining >= amount;

  return {
    allowed,
    remaining,
    message: allowed
      ? `Budget check passed. Remaining: $${remaining.toFixed(2)}`
      : `Budget exceeded! Requested: $${amount.toFixed(2)}, Remaining: $${remaining.toFixed(2)}`
  };
}

/**
 * Compare vendor prices for cost optimization
 */
export async function compareVendorPrices(inventoryId: string): Promise<CostComparison | null> {
  console.log("[Budget Agent] Comparing vendor prices...");

  // Get inventory item
  const { data: item, error: itemError } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', inventoryId)
    .single();

  if (itemError || !item) {
    return null;
  }

  // Get all vendors for this category
  const { data: vendors, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .or(`specialization.eq.${item.category},specialization.eq.General`);

  if (vendorError || !vendors || vendors.length === 0) {
    return null;
  }

  // For demo purposes, simulate price variations
  // In production, this would fetch actual vendor quotes
  const currentPrice = parseFloat(item.unit_price || 0);
  const alternativeVendors = vendors.map((vendor, index) => {
    // Simulate price variation (-15% to +10%)
    const variation = (Math.random() * 0.25 - 0.15);
    const price = currentPrice * (1 + variation);
    const savings = currentPrice - price;
    const savingsPercentage = (savings / currentPrice) * 100;

    return {
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      price: Math.round(price * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savings_percentage: Math.round(savingsPercentage * 100) / 100
    };
  }).filter(v => v.savings > 0) // Only show vendors with better prices
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 3); // Top 3 alternatives

  return {
    inventory_id: inventoryId,
    item_name: item.item_name,
    current_vendor_price: currentPrice,
    alternative_vendors: alternativeVendors
  };
}

/**
 * Create a purchase order
 */
export async function createPurchaseOrder(
  taskId: string | null,
  vendorId: string,
  inventoryId: string,
  quantity: number,
  unitPrice: number,
  expectedDeliveryDate?: string
): Promise<string> {
  const totalCost = quantity * unitPrice;

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert({
      task_id: taskId,
      vendor_id: vendorId,
      inventory_id: inventoryId,
      quantity,
      unit_price: unitPrice,
      total_cost: totalCost,
      status: 'Draft',
      expected_delivery_date: expectedDeliveryDate
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create purchase order: ${error.message}`);
  }

  return data.id;
}
