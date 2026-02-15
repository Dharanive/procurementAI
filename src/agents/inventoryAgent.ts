import { supabase } from '@/lib/supabase';
import { InventoryItem } from '../types';

/**
 * Inventory Agent
 * Responsible for monitoring stock levels and identifying procurement needs.
 */
export async function checkInventoryNeeds(): Promise<InventoryItem[]> {
    console.log("[Inventory Agent] Checking stock levels...");

    const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .or('status.eq.Low Stock,status.eq.Out of Stock');

    if (error) {
        console.error("[Inventory Agent] Error fetching inventory:", error);
        return [];
    }

    console.log(`[Inventory Agent] Found ${data?.length || 0} items needing replenishment.`);
    return data as InventoryItem[];
}
