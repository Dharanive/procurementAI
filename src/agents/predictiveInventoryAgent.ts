import { supabase } from '@/lib/supabase';
import { InventoryItem } from '@/types';

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

/**
 * Predictive Inventory Agent
 * Analyzes consumption history to predict future shortages
 */
export async function predictInventoryShortages(): Promise<InventoryPrediction[]> {
  console.log("[Predictive Inventory Agent] Analyzing consumption patterns...");

  try {
    // Get all inventory items
    const { data: inventoryItems, error: invError } = await supabase
      .from('inventory')
      .select('*');

    if (invError || !inventoryItems) {
      throw new Error(`Failed to fetch inventory: ${invError?.message}`);
    }

    const predictions: InventoryPrediction[] = [];

    for (const item of inventoryItems as InventoryItem[]) {
      // Get consumption history for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: consumptionHistory, error: histError } = await supabase
        .from('inventory_consumption_history')
        .select('*')
        .eq('inventory_id', item.id)
        .gte('consumption_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('consumption_date', { ascending: false });

      if (histError) {
        console.error(`[Predictive Inventory Agent] Error fetching history for ${item.item_name}:`, histError);
        continue;
      }

      // Calculate average daily consumption
      let averageDailyConsumption = 0;
      if (consumptionHistory && consumptionHistory.length > 0) {
        const totalConsumed = consumptionHistory.reduce((sum, record) => sum + (record.quantity_consumed || 0), 0);
        const daysTracked = Math.max(1, Math.floor(
          (new Date().getTime() - new Date(consumptionHistory[consumptionHistory.length - 1].consumption_date).getTime()) / (1000 * 60 * 60 * 24)
        ));
        averageDailyConsumption = totalConsumed / daysTracked;
      } else {
        // If no history, use a default based on current stock and threshold
        // Assume 10% of threshold per day as a conservative estimate
        averageDailyConsumption = item.min_threshold * 0.1;
      }

      // Predict days until depletion
      const daysUntilDepletion = averageDailyConsumption > 0
        ? Math.floor(item.current_stock / averageDailyConsumption)
        : 999; // Infinite if no consumption

      const predictedDepletionDate = new Date();
      predictedDepletionDate.setDate(predictedDepletionDate.getDate() + daysUntilDepletion);

      // Determine risk level
      let risk_level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      let recommended_action = 'Monitor stock levels';

      if (daysUntilDepletion <= 3) {
        risk_level = 'Critical';
        recommended_action = 'URGENT: Reorder immediately to prevent stockout';
      } else if (daysUntilDepletion <= 7) {
        risk_level = 'High';
        recommended_action = 'High priority: Place order within 24 hours';
      } else if (daysUntilDepletion <= 14) {
        risk_level = 'Medium';
        recommended_action = 'Plan reorder within next week';
      } else {
        risk_level = 'Low';
        recommended_action = 'Stock levels healthy, continue monitoring';
      }

      predictions.push({
        inventory_id: item.id,
        item_name: item.item_name,
        category: item.category,
        current_stock: item.current_stock,
        min_threshold: item.min_threshold,
        average_daily_consumption: Math.round(averageDailyConsumption * 100) / 100,
        days_until_depletion: daysUntilDepletion,
        predicted_depletion_date: predictedDepletionDate,
        risk_level,
        recommended_action
      });
    }

    // Sort by risk level and days until depletion
    const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    predictions.sort((a, b) => {
      if (riskOrder[a.risk_level] !== riskOrder[b.risk_level]) {
        return riskOrder[a.risk_level] - riskOrder[b.risk_level];
      }
      return a.days_until_depletion - b.days_until_depletion;
    });

    console.log(`[Predictive Inventory Agent] Generated ${predictions.length} predictions`);
    return predictions;

  } catch (error) {
    console.error("[Predictive Inventory Agent] Error:", error);
    throw error;
  }
}

/**
 * Record consumption for an inventory item
 */
export async function recordConsumption(
  inventoryId: string,
  quantity: number,
  date?: Date
): Promise<void> {
  const { error } = await supabase
    .from('inventory_consumption_history')
    .insert({
      inventory_id: inventoryId,
      quantity_consumed: quantity,
      consumption_date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });

  if (error) {
    throw new Error(`Failed to record consumption: ${error.message}`);
  }
}
