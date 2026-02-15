import { NextRequest, NextResponse } from 'next/server';
import { createProcurementGraph } from '@/agents/orchestrator';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { taskId } = body;

        if (!taskId) {
            return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
        }

        console.log(`[API] Received assignment request for Task ID: ${taskId}`);

        // Initialize the LangGraph
        const app = createProcurementGraph();

        // Execute the graph
        // We pass the initial state
        const result: any = await app.invoke({
            taskId: taskId,
            employees: [],
            logs: []
        });

        console.log("[API] Graph execution completed:", result);

        if (result.error) {
            return NextResponse.json({ error: result.error, logs: result.logs }, { status: 500 });
        }

        if (!result.assignmentResult) {
            return NextResponse.json({ error: "Assignment could not be completed.", logs: result.logs }, { status: 422 });
        }

        return NextResponse.json({
            assignedTo: result.assignmentResult.best_employee_name,
            score: result.assignmentResult.score,
            reasoning: result.assignmentResult.reasoning,
            logs: result.logs
        });

    } catch (error: any) {
        console.error("[API] Internal Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
