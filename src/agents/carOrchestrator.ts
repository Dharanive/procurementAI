import { StateGraph, END } from "@langchain/langgraph";
import { fetchWorkforce } from "./workforceAgent";
import { assignTask, AssignmentResult } from "./assignmentAgent";
import { checkInventoryNeeds } from "./inventoryAgent";
import { findBestVendor, VendorRecommendation } from "./vendorAgent";
import { supabase } from "@/lib/supabase";
import { User, InventoryItem, Vendor } from "@/types";

interface CarAppState {
    inventoryItems: InventoryItem[];
    selectedItem?: InventoryItem;
    recommendedVendor?: VendorRecommendation | null;
    employees: User[];
    assignmentResult?: AssignmentResult | null;
    logs: string[];
    error?: string;
}

// Node 1: Stock Check
async function inventoryNode(state: CarAppState): Promise<Partial<CarAppState>> {
    console.log("--- CAR COMPANY: Monitoring Inventory ---");
    const needs = await checkInventoryNeeds();
    if (needs.length === 0) {
        return {
            logs: [...state.logs, "Inventory Agent: All car parts in stock. No action needed."]
        };
    }
    const item = needs[0]; // Process the first urgent item
    return {
        inventoryItems: needs,
        selectedItem: item,
        logs: [...state.logs, `Inventory Agent: Detected low stock for ${item.item_name} (${item.current_stock}/${item.min_threshold}).`]
    };
}

// Node 2: Sourcing
async function sourcingNode(state: CarAppState): Promise<Partial<CarAppState>> {
    if (!state.selectedItem) return {};

    console.log("--- CAR COMPANY: Sourcing Vendor ---");
    const { data: vendors } = await supabase.from('vendors').select('*');
    const recommendation = await findBestVendor(state.selectedItem, vendors as Vendor[]);

    return {
        recommendedVendor: recommendation,
        logs: [...state.logs, recommendation
            ? `Vendor Agent: Recommended ${recommendation.best_vendor_name} for high-quality parts.`
            : "Vendor Agent: No suitable vendor found."]
    };
}

// Node 3: Workforce & Assignment
async function assignmentNode(state: CarAppState): Promise<Partial<CarAppState>> {
    if (!state.selectedItem || !state.recommendedVendor) return {};

    console.log("--- CAR COMPANY: Orchestrating Task Assignment ---");
    const employees = await fetchWorkforce();

    // Create the task in DB first
    const { data: task, error } = await supabase
        .from('procurement_tasks')
        .insert({
            title: `Procure ${state.selectedItem.item_name} from ${state.recommendedVendor.best_vendor_name}`,
            required_skill: 'Procurement',
            estimated_hours: 4,
            priority: state.selectedItem.current_stock === 0 ? 'High' : 'Medium',
            status: 'Pending'
        })
        .select()
        .single();

    if (error) return { error: error.message };

    const result = await assignTask(task.id, employees);

    return {
        assignmentResult: result,
        logs: [...state.logs, `Assignment Agent: Successfully allocated task to ${result?.best_employee_name}.`]
    };
}

export const createCarCompanyGraph = () => {
    const workflow = new StateGraph<CarAppState>({
        channels: {
            inventoryItems: { value: (l, r) => r ?? l, default: () => [] },
            selectedItem: { value: (l, r) => r ?? l, default: () => undefined },
            recommendedVendor: { value: (l, r) => r ?? l, default: () => null },
            employees: { value: (l, r) => r ?? l, default: () => [] },
            assignmentResult: { value: (l, r) => r ?? l, default: () => null },
            logs: { value: (l, r) => [...(l || []), ...(r || [])], default: () => [] },
            error: { value: (l, r) => r ?? l, default: () => undefined }
        }
    });

    workflow.addNode("inventory", inventoryNode);
    workflow.addNode("sourcing", sourcingNode);
    workflow.addNode("assignment", assignmentNode);

    workflow.setEntryPoint("inventory" as any);
    workflow.addEdge("inventory" as any, "sourcing" as any);
    workflow.addEdge("sourcing" as any, "assignment" as any);
    workflow.addEdge("assignment" as any, END);

    return workflow.compile();
};
