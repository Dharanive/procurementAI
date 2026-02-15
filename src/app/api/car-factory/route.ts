import { NextRequest, NextResponse } from 'next/server';
import { createCarCompanyGraph } from '@/agents/carOrchestrator';

export async function POST(req: NextRequest) {
    try {
        console.log(`[API] Triggering Car Company Automated Workflow...`);

        const app = createCarCompanyGraph();

        const result: any = await app.invoke({
            inventoryItems: [],
            employees: [],
            logs: []
        });

        console.log("[API] Car Company Workflow completed.");

        if (result.error) {
            return NextResponse.json({ error: result.error, logs: result.logs }, { status: 500 });
        }

        return NextResponse.json({
            selectedItem: result.selectedItem,
            recommendedVendor: result.recommendedVendor,
            assignmentResult: result.assignmentResult,
            logs: result.logs
        });

    } catch (error: any) {
        console.error("[API] Internal Error:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
