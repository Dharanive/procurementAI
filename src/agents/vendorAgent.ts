import { supabase } from '@/lib/supabase';
import { Vendor, InventoryItem } from '../types';
import { ChatOpenAI } from "@langchain/openai";

export interface VendorRecommendation {
    best_vendor_id: string;
    best_vendor_name: string;
    reasoning: string;
}

/**
 * Vendor Agent (AI-Powered)
 * Analyzes vendors and items to recommend the best supplier.
 */
export async function findBestVendor(
    item: InventoryItem,
    vendors: Vendor[]
): Promise<VendorRecommendation | null> {
    const llm = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.2,
        openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vendorContext = vendors.map((v, idx) => `
Vendor ${idx + 1}:
- Name: ${v.name}
- Specialization: ${v.specialization}
- Rating: ${v.rating}/5
- Reliability: ${(v.reliability_score * 100).toFixed(0)}%
- Lead Time: ${v.average_lead_time_days} days
    `.trim()).join('\n\n');

    const prompt = `You are a strategic sourcing AI. Recommend the best vendor for the following item.

ITEM TO PROCURE:
- Name: ${item.item_name}
- Category: ${item.category}
- Current Stock: ${item.current_stock} (Threshold: ${item.min_threshold})

AVAILABLE VENDORS:
${vendorContext}

CRITERIA:
1. Specialization Match: High priority.
2. Reliability & Rating: Balance quality and speed.
3. Urgency: If stock is 0, lead time is critical.

Response Format (JSON):
{
  "best_vendor_name": "Vendor Name",
  "reasoning": "Reason why this vendor is the best fit for this specific car part."
}

Respond ONLY with valid JSON.`;

    console.log(`[Vendor Agent] Analyzing vendors for ${item.item_name}...`);

    const response = await llm.invoke(prompt);
    const aiResponse = response.content.toString();

    try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found");
        const decision = JSON.parse(jsonMatch[0]);

        const vendor = vendors.find(v => v.name.toLowerCase() === decision.best_vendor_name.toLowerCase());

        if (!vendor) return null;

        return {
            best_vendor_id: vendor.id,
            best_vendor_name: vendor.name,
            reasoning: decision.reasoning
        };
    } catch (e) {
        console.error("[Vendor Agent] Failed to parse decision:", e);
        return null;
    }
}
