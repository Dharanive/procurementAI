import { StateGraph, END } from "@langchain/langgraph";
import { fetchWorkforce } from "./workforceAgent";
import { assignTask, AssignmentResult } from "./assignmentAgent";
import { User } from "@/types";

// 1. Define the State
interface AgentState {
    taskId: string;
    employees: User[];
    assignmentResult?: AssignmentResult | null;
    error?: string;
    logs: string[];
}

// 2. Define Nodes

// Node 1: Workforce Agent
async function workforceNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("--- WORKFORCE AGENT: Fetching Employees ---");
    try {
        const employees = await fetchWorkforce();
        return {
            employees,
            logs: [...state.logs, `Workforce Agent: Fetched ${employees.length} employees.`]
        };
    } catch (error: any) {
        return {
            error: error.message,
            logs: [...state.logs, `Workforce Agent Error: ${error.message}`]
        };
    }
}

// Node 2: Assignment Agent (AI-Powered)
async function assignmentNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("--- AI ASSIGNMENT AGENT: Analyzing with OpenAI ---");
    try {
        if (!state.employees || state.employees.length === 0) {
            throw new Error("No employees available for assignment.");
        }

        // Call the AI-powered assignment logic
        const result = await assignTask(state.taskId, state.employees);

        if (!result) {
            return {
                error: "Assignment failed: No suitable employee found.",
                logs: [...state.logs, "❌ AI Assignment Agent: Failed to find suitable employee."]
            }
        }

        return {
            assignmentResult: result,
            logs: [...state.logs, `✅ AI Assignment Agent: Selected ${result.best_employee_name} (AI Score: ${result.score.toFixed(2)})`]
        };
    } catch (error: any) {
        return {
            error: error.message,
            logs: [...state.logs, `❌ AI Assignment Agent Error: ${error.message}`]
        };
    }
}

// 3. Create the Graph
export const createProcurementGraph = () => {
    const workflow = new StateGraph<AgentState>({
        channels: {
            taskId: {
                value: (left?: string, right?: string) => right ?? left ?? "",
                default: () => ""
            },
            employees: {
                value: (left?: User[], right?: User[]) => right ?? left ?? [],
                default: () => []
            },
            assignmentResult: {
                value: (left?: AssignmentResult | null, right?: AssignmentResult | null) => right ?? left ?? null,
                default: () => null
            },
            error: {
                value: (left?: string, right?: string) => right ?? left,
                default: () => undefined
            },
            logs: {
                value: (left: string[] = [], right: string[] = []) => [...left, ...right],
                default: () => []
            }
        }
    });

    workflow.addNode("workforceAgent", workforceNode);
    workflow.addNode("assignmentAgent", assignmentNode);

    workflow.setEntryPoint("workforceAgent" as any);
    workflow.addEdge("workforceAgent" as any, "assignmentAgent" as any);
    workflow.addEdge("assignmentAgent" as any, END);

    return workflow.compile();
};
